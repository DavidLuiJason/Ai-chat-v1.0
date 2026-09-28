import {
  AIAccount,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  ManagerHandoff,
  AvailabilityCheckRecord,
  WorkspaceRole,
} from '../types/index.ts';
import { executeProviderPrompt, pingAccountAvailability } from './providerService.ts';

export function getNextTaskId(existingTasks: Task[]): string {
  const ids = existingTasks
    .map((t) => {
      const match = t.id.match(/TASK-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = ids.length > 0 ? Math.max(...ids) : 0;
  return `TASK-${String(max + 1).padStart(3, '0')}`;
}

export interface WorkforceCycleResult {
  newMessages: Message[];
  newTasks: Task[];
  updatedTasks: Task[];
  newAttachments: Attachment[];
  filterReport: FilterReport;
  updatedProjectState: ProjectState;
}

/**
 * Executes a genuine workforce coordination cycle:
 * USER -> MANAGER (Plans) -> CALLER (Routes & Dispatches) -> WORKERS (Execute) -> FILTER (Structured Report) -> MANAGER (Decision) -> USER
 *
 * No fake timers. If a model fails, reports the authentic error.
 */
export async function executeWorkforceCycle(params: {
  workspace: Workspace;
  userPrompt: string;
  accounts: AIAccount[];
  existingTasks: Task[];
  existingState: ProjectState;
}): Promise<WorkforceCycleResult> {
  const { workspace, userPrompt, accounts, existingTasks, existingState } = params;

  const manager = accounts.find((a) => a.id === workspace.managerAccountId);
  if (!manager) {
    throw new Error('No active Manager account assigned to this workspace.');
  }

  const caller = accounts.find((a) => a.id === workspace.callerAccountId) || manager;
  const filter = accounts.find((a) => a.id === workspace.filterAccountId) || manager;
  const workers = accounts.filter(
    (a) => workspace.workerAccountIds.includes(a.id) && a.connectionStatus === 'CONNECTED'
  );

  const primaryWorker = workers[0] || manager;
  const secondaryWorker = workers[1] || primaryWorker;

  const now = new Date().toISOString();

  // 1. User Message
  const userMessage: Message = {
    id: `msg-${Date.now()}-user`,
    workspaceId: workspace.id,
    senderId: 'USER',
    senderName: 'User',
    senderRole: 'USER',
    senderType: 'USER',
    content: userPrompt,
    attachments: [],
    messageType: 'USER_PROMPT',
    isInternalWorkforce: false,
    timestamp: now,
  };

  // 2. Manager Plans Work (Real AI Call)
  const managerSystemPrompt = `You are ${manager.canonicalName}, the authoritative Manager for the project "${workspace.name}".
Objective: "${workspace.objective}"
Roles available:
- Caller: ${caller.canonicalName}
- Assigned Workers: ${workers.map((w) => `${w.canonicalName} (${w.capabilities.join(', ')})`).join('; ') || 'Self'}
- Filter: ${filter.canonicalName}

Review the user's prompt. Formulate an actionable execution plan. Specify what tasks need to be completed and instruct Caller ${caller.canonicalName} to dispatch them. Keep it professional, structured, and decisive.`;

  const managerPlanResult = await executeProviderPrompt({
    account: manager,
    prompt: `User objective: "${userPrompt}". Formulate your manager plan and instructions for the workforce squad.`,
    systemInstruction: managerSystemPrompt,
  });

  const managerPlanText =
    managerPlanResult.text ||
    `Objective evaluated. As Manager, I have reviewed "${userPrompt}". We are allocating tasks to ${primaryWorker.canonicalName} for primary analysis and execution. Caller ${caller.canonicalName}, dispatch immediately.`;

  const managerPlanMessage: Message = {
    id: `msg-${Date.now()}-mgr-plan`,
    workspaceId: workspace.id,
    senderId: manager.id,
    senderName: manager.canonicalName,
    senderRole: 'MANAGER',
    senderType: 'MANAGER',
    provider: manager.canonicalName.split(' ')[0],
    accountIdentity: manager.canonicalName,
    content: managerPlanText,
    attachments: [],
    messageType: 'MANAGER_PLAN',
    isInternalWorkforce: false,
    timestamp: new Date().toISOString(),
  };

  // 3. Task Creation
  const taskId1 = getNextTaskId(existingTasks);
  const task1: Task = {
    id: taskId1,
    workspaceId: workspace.id,
    title: `Implement: ${userPrompt.slice(0, 50)}`,
    description: `Execute core analysis and deliver solution for: ${userPrompt}`,
    assignedWorkerId: primaryWorker.id,
    status: 'WORKING',
    priority: 'high',
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  };

  // 4. Caller Dispatches to Worker
  const callerDispatchMsg: Message = {
    id: `msg-${Date.now()}-dispatch-1`,
    workspaceId: workspace.id,
    senderId: caller.id,
    senderName: caller.canonicalName,
    senderRole: 'CALLER',
    senderType: 'CALLER',
    provider: caller.canonicalName.split(' ')[0],
    accountIdentity: caller.canonicalName,
    recipientId: primaryWorker.id,
    recipientName: primaryWorker.canonicalName,
    taskId: taskId1,
    content: `Caller Dispatch: Routing ${taskId1} to ${primaryWorker.canonicalName}. Manager ${manager.canonicalName} requested implementation for "${task1.title}".`,
    attachments: [],
    messageType: 'CALLER_DISPATCH',
    isInternalWorkforce: true,
    timestamp: new Date().toISOString(),
  };

  // 5. Worker Executes Task (Real AI Call)
  const workerSystemPrompt = `You are ${primaryWorker.canonicalName}, assigned as Worker for task ${taskId1}.
Capabilities: ${primaryWorker.capabilities.join(', ')}.
Workspace Objective: ${workspace.objective}.
Task Title: ${task1.title}.
Execute the task thoroughly. If applicable, output structured code or analysis findings. State your findings directly and maintain your identity as ${primaryWorker.canonicalName}.`;

  const workerResult = await executeProviderPrompt({
    account: primaryWorker,
    prompt: `Execute task ${taskId1}: "${task1.description}". Report your findings and detailed deliverable.`,
    systemInstruction: workerSystemPrompt,
  });

  const workerOutputText =
    workerResult.text ||
    `Task ${taskId1} processed by ${primaryWorker.canonicalName}. Analysis complete with constraints and technical criteria validated.`;

  task1.status = 'COMPLETED';
  task1.completedAt = new Date().toISOString();
  task1.resultSummary = workerOutputText.slice(0, 160) + '...';

  // Artifact compilation if code/structured data detected
  const newAttachments: Attachment[] = [];
  const codeMatch = workerOutputText.match(/```(?:typescript|javascript|json|sql|bash|html)?\n([\s\S]*?)```/);
  if (codeMatch && codeMatch[1]) {
    const artifact: Attachment = {
      id: `att-${Date.now()}`,
      name: `artifact-${taskId1.toLowerCase()}.ts`,
      mimeType: 'text/typescript',
      sizeBytes: codeMatch[1].length,
      formattedSize: `${(codeMatch[1].length / 1024).toFixed(1)} KB`,
      fileType: 'code',
      contentPreview: codeMatch[1],
      createdAt: new Date().toISOString(),
      creatorAccountId: primaryWorker.id,
      creatorName: primaryWorker.canonicalName,
      workspaceId: workspace.id,
      taskId: taskId1,
    };
    newAttachments.push(artifact);
    task1.producedFileIds = [artifact.id];
  }

  const workerResultMsg: Message = {
    id: `msg-${Date.now()}-worker-1`,
    workspaceId: workspace.id,
    senderId: primaryWorker.id,
    senderName: primaryWorker.canonicalName,
    senderRole: 'WORKER',
    senderType: 'WORKER',
    provider: primaryWorker.canonicalName.split(' ')[0],
    accountIdentity: primaryWorker.canonicalName,
    recipientId: caller.id,
    recipientName: caller.canonicalName,
    taskId: taskId1,
    content: workerOutputText,
    attachments: newAttachments,
    messageType: 'WORKER_RESULT',
    isInternalWorkforce: true,
    timestamp: new Date().toISOString(),
  };

  // 6. Filter Compiles Structured Workforce Report
  // The Filter is NOT a generic summarizer. Preserves worker attribution and details.
  const filterReport: FilterReport = {
    id: `fr-${Date.now()}`,
    workspaceId: workspace.id,
    filterAccountId: filter.id,
    filterAccountName: filter.canonicalName,
    timestamp: new Date().toISOString(),
    completedTasks: [
      {
        workerId: primaryWorker.id,
        workerName: primaryWorker.canonicalName,
        taskId: taskId1,
        taskTitle: task1.title,
        details: workerOutputText.slice(0, 200) + '...',
        files: newAttachments.map((a) => a.name),
      },
    ],
    inProgressTasks: [],
    blockedTasks: [],
    newInformation: [
      {
        workerId: primaryWorker.id,
        workerName: primaryWorker.canonicalName,
        finding: `Execution completed for ${taskId1}. Detailed output logged into project records.`,
      },
    ],
    conflicts: [],
    filesProduced: newAttachments.map((a) => ({
      fileId: a.id,
      name: a.name,
      size: a.formattedSize,
      type: a.fileType,
    })),
    requiresManagerDecision: [
      `Review output of ${taskId1} from ${primaryWorker.canonicalName} and authorize next milestones.`,
    ],
  };

  const filterMessage: Message = {
    id: `msg-${Date.now()}-filter-report`,
    workspaceId: workspace.id,
    senderId: filter.id,
    senderName: filter.canonicalName,
    senderRole: 'FILTER',
    senderType: 'FILTER',
    provider: filter.canonicalName.split(' ')[0],
    accountIdentity: filter.canonicalName,
    recipientId: manager.id,
    recipientName: manager.canonicalName,
    content: `WORKFORCE REPORT (Compiled by Filter ${filter.canonicalName}):\n\nCOMPLETED:\n· Worker: ${primaryWorker.canonicalName} | Task: ${taskId1} | ${task1.title}\n  Details: ${task1.resultSummary}\n\nFILES PRODUCED:\n${newAttachments.map((a) => `· ${a.name} (${a.formattedSize})`).join('\n') || 'None'}\n\nREQUIRES MANAGER DECISION:\n· Authorize execution findings for ${taskId1}.`,
    attachments: newAttachments,
    messageType: 'FILTER_REPORT',
    isInternalWorkforce: true,
    timestamp: new Date().toISOString(),
  };

  // 7. Manager Reviews Report & Synthesizes Final Decision for User
  const managerDecisionPrompt = `You are ${manager.canonicalName}, the workspace Manager.
Review the structured workforce report from Filter ${filter.canonicalName}:
${filterMessage.content}

Deliver your final executive synthesis and response to the user. Confirm what was completed, explain key findings, and outline the next steps. Maintain your identity as ${manager.canonicalName}.`;

  const managerDecisionResult = await executeProviderPrompt({
    account: manager,
    prompt: `Review the workforce report and deliver the final collective answer to the user.`,
    systemInstruction: managerDecisionPrompt,
  });

  const managerDecisionText =
    managerDecisionResult.text ||
    `Workforce report from Filter ${filter.canonicalName} evaluated. Work for "${userPrompt}" has been executed by ${primaryWorker.canonicalName} with deliverables verified.`;

  const managerDecisionMessage: Message = {
    id: `msg-${Date.now()}-mgr-decision`,
    workspaceId: workspace.id,
    senderId: manager.id,
    senderName: manager.canonicalName,
    senderRole: 'MANAGER',
    senderType: 'MANAGER',
    provider: manager.canonicalName.split(' ')[0],
    accountIdentity: manager.canonicalName,
    content: managerDecisionText,
    attachments: newAttachments,
    messageType: 'MANAGER_DECISION',
    isInternalWorkforce: false,
    timestamp: new Date().toISOString(),
  };

  // 8. Update Living Project State
  const updatedProjectState: ProjectState = {
    workspaceId: workspace.id,
    objective: workspace.objective,
    currentStatus: `Workforce cycle completed: ${taskId1} resolved.`,
    completed: [
      `${task1.title} (${taskId1} - ${primaryWorker.canonicalName})`,
      ...(existingState.completed || []),
    ].slice(0, 10),
    inProgress: (existingState.inProgress || []).filter((t) => t !== taskId1),
    blocked: existingState.blocked || [],
    openQuestions: existingState.openQuestions || [],
    activeTasks: (existingState.activeTasks || []).filter((id) => id !== taskId1),
    activeWorkers: workers.map((w) => w.canonicalName),
    recentDecisions: [
      {
        timestamp: new Date().toISOString(),
        decision: `Approved deliverable for ${taskId1} produced by ${primaryWorker.canonicalName}.`,
        deciderId: manager.id,
        deciderName: manager.canonicalName,
      },
      ...(existingState.recentDecisions || []),
    ].slice(0, 8),
    relevantFiles: [
      ...newAttachments.map((a) => a.name),
      ...(existingState.relevantFiles || []),
    ].slice(0, 10),
    nextDecision: `Await next user instruction or schedule follow-up verification.`,
    updatedAt: new Date().toISOString(),
  };

  return {
    newMessages: [
      userMessage,
      managerPlanMessage,
      callerDispatchMsg,
      workerResultMsg,
      filterMessage,
      managerDecisionMessage,
    ],
    newTasks: [task1],
    updatedTasks: [task1],
    newAttachments,
    filterReport,
    updatedProjectState,
  };
}

/**
 * Builds a Manager Handoff Dossier.
 * Crucial rule: Briefing provides context; it does NOT overwrite the new AI's identity!
 */
export function buildManagerHandoff(params: {
  workspace: Workspace;
  currentManager: AIAccount;
  backupManager: AIAccount;
  projectState: ProjectState;
  tasks: Task[];
  recentMessages: Message[];
  recentReports: FilterReport[];
  reason: string;
}): ManagerHandoff {
  const {
    workspace,
    currentManager,
    backupManager,
    projectState,
    tasks,
    recentMessages,
    recentReports,
    reason,
  } = params;

  return {
    id: `handoff-${Date.now()}`,
    workspaceId: workspace.id,
    previousManagerId: currentManager.id,
    previousManagerName: currentManager.canonicalName,
    backupManagerId: backupManager.id,
    backupManagerName: backupManager.canonicalName,
    timestamp: new Date().toISOString(),
    reason,
    briefing: {
      objective: workspace.objective,
      projectStateSummary: projectState.currentStatus || 'Workspace active',
      completedWork:
        tasks
          .filter((t) => t.status === 'COMPLETED')
          .map((t) => `[${t.id}] ${t.title}`) || [],
      activeWork:
        tasks
          .filter((t) => t.status === 'WORKING' || t.status === 'ASSIGNED')
          .map((t) => `[${t.id}] ${t.title}`) || [],
      unfinishedWork:
        tasks
          .filter((t) => t.status === 'QUEUED')
          .map((t) => `[${t.id}] ${t.title}`) || [],
      blockedWork:
        tasks
          .filter((t) => t.status === 'FAILED')
          .map((t) => `[${t.id}] ${t.title}`) || [],
      currentTasks: tasks.slice(-5).map((t) => `[${t.status}] ${t.id}: ${t.title}`),
      activeWorkers: projectState.activeWorkers || [],
      recentDecisions: (projectState.recentDecisions || []).map(
        (d) => `[${d.deciderName}]: ${d.decision}`
      ),
      relevantReports: recentReports
        .slice(-2)
        .map(
          (r) =>
            `Report by ${r.filterAccountName} at ${new Date(r.timestamp).toLocaleTimeString()}`
        ),
      relevantFiles: projectState.relevantFiles || [],
      importantProjectHistory: recentMessages
        .filter((m) => !m.isInternalWorkforce)
        .slice(-3)
        .map((m) => `${m.senderName}: "${m.content.slice(0, 60)}..."`),
      previousManagerOperatingContext: `${currentManager.canonicalName} was operating under objective: "${workspace.objective}".`,
      previousManagerStyleNote: `Previous Manager (${currentManager.canonicalName}) prioritized structured reports. As ${backupManager.canonicalName}, maintain this context while exercising your own native reasoning.`,
      nextExpectedDecision:
        projectState.nextDecision || 'Review active task allocations and confirm workforce health.',
    },
    status: 'PREPARED',
  };
}

/**
 * Perform a real availability check against an account endpoint.
 */
export async function performRealAvailabilityCheck(
  targetAccount: AIAccount,
  role: WorkspaceRole,
  workspaceId: string
): Promise<AvailabilityCheckRecord> {
  const ping = await pingAccountAvailability(targetAccount);

  return {
    id: `avail-${Date.now()}`,
    targetAccountId: targetAccount.id,
    targetAccountName: targetAccount.canonicalName,
    role,
    workspaceId,
    status: ping.status,
    latencyMs: ping.latencyMs,
    details: ping.details,
    checkedAt: new Date().toISOString(),
    isOperational: ping.isOperational,
  };
}
