export type InteractionMode = 'api' | 'web_session' | 'embedded' | 'external' | 'file_exchange';

export type AuthType = 'server_environment' | 'api_key' | 'google_oauth' | 'provider_session';

export interface Provider {
  id: string;
  name: string;
  vendor: string;
  description: string;
  supportedModes: InteractionMode[];
  supportedAuth: AuthType[];
  iconKey: 'google-ai-studio' | 'gemini' | 'chatgpt' | 'claude' | 'grok' | 'custom';
  authInstructions: string;
  isCustom?: boolean;
}

export type ConnectionStatus =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'AUTHENTICATION_REQUIRED'
  | 'CONNECTION_ERROR'
  | 'UNAVAILABLE';

export type WorkerAvailability =
  | 'AVAILABLE'
  | 'WORKING'
  | 'WAITING'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface AIAccount {
  id: string;
  providerId: string;
  canonicalName: string; // e.g. "ChatGPT 1", "ChatGPT 2", "Google AI Studio 1"
  identityNumber: number;
  friendlyDescription?: string;
  authType: AuthType;
  connectionStatus: ConnectionStatus;
  capabilities: string[];
  availability: WorkerAvailability;
  currentTaskId?: string;
  totalTasksCompleted: number;
  filesProducedCount: number;
  lastActivityAt?: string;
  connectedAt: string;
  apiKey?: string; // Stored securely in client state for API calls
  isRemoved?: boolean; // When disconnected/removed, historical logs preserve identity
}

export type WorkspaceRole = 'MANAGER' | 'BACKUP_MANAGER' | 'CALLER' | 'FILTER' | 'WORKER';

export interface RoleDefinition {
  id: WorkspaceRole;
  label: string;
  shortDesc: string;
  fullDesc: string;
}

export const WORKSPACE_ROLES: RoleDefinition[] = [
  {
    id: 'MANAGER',
    label: 'Manager',
    shortDesc: 'Primary decision-maker & planner',
    fullDesc:
      'Understands user objectives, decomposes work, assigns tasks, reviews workforce reports, resolves conflicts, and decides next actions.',
  },
  {
    id: 'BACKUP_MANAGER',
    label: 'Backup Manager',
    shortDesc: 'Designated replacement manager',
    fullDesc:
      'Maintains current project state context. Activates seamlessly when the active Manager becomes unavailable without overwriting identity.',
  },
  {
    id: 'CALLER',
    label: 'Caller',
    shortDesc: 'Communication & dispatch coordinator',
    fullDesc:
      'Routes tasks to Workers, tracks response states and timers, monitors availability, and coordinates Manager briefings.',
  },
  {
    id: 'FILTER',
    label: 'Filter',
    shortDesc: 'Structured report compiler',
    fullDesc:
      'Compiles structured workforce reports from Worker outputs without summarizing away critical details or worker attribution.',
  },
  {
    id: 'WORKER',
    label: 'Worker',
    shortDesc: 'Task execution specialist',
    fullDesc:
      'Performs assigned work, delivers code and technical artifacts, and answers action requests dispatched by Caller or User.',
  },
];

export type TaskStatus =
  | 'QUEUED'
  | 'ASSIGNED'
  | 'WORKING'
  | 'WAITING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Task {
  id: string; // e.g. "TASK-001"
  workspaceId: string;
  title: string;
  description: string;
  assignedWorkerId: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  producedFileIds?: string[];
  blockReason?: string;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  formattedSize: string;
  contentPreview?: string;
  fileType: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'zip' | 'code' | 'csv' | 'other';
  createdAt: string;
  creatorAccountId?: string;
  creatorName?: string;
  workspaceId?: string;
  taskId?: string;
}

export type MessageType =
  | 'USER_PROMPT'
  | 'MANAGER_PLAN'
  | 'CALLER_DISPATCH'
  | 'WORKER_RESULT'
  | 'FILTER_REPORT'
  | 'MANAGER_DECISION'
  | 'AVAILABILITY_ALERT'
  | 'HANDOFF_EVENT'
  | 'DIRECT_CHAT';

export interface Message {
  id: string;
  workspaceId?: string;
  directChatAccountId?: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderType: 'USER' | 'MANAGER' | 'CALLER' | 'WORKER' | 'FILTER' | 'SYSTEM';
  provider?: string;
  accountIdentity?: string;
  recipientId?: string;
  recipientName?: string;
  taskId?: string;
  content: string;
  attachments: Attachment[];
  messageType: MessageType;
  isInternalWorkforce: boolean;
  timestamp: string;
  isAccountRemoved?: boolean;
}

export interface FilterReport {
  id: string;
  workspaceId: string;
  filterAccountId: string;
  filterAccountName: string;
  timestamp: string;
  completedTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    details: string;
    files?: string[];
  }[];
  inProgressTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    currentProgress: string;
  }[];
  blockedTasks: {
    workerId: string;
    workerName: string;
    taskId: string;
    taskTitle: string;
    reason: string;
  }[];
  newInformation: {
    workerId: string;
    workerName: string;
    finding: string;
  }[];
  conflicts: {
    workerA: string;
    workerB: string;
    description: string;
  }[];
  filesProduced: {
    fileId: string;
    name: string;
    size: string;
    type: string;
  }[];
  requiresManagerDecision: string[];
}

export interface ProjectDecision {
  timestamp: string;
  decision: string;
  deciderId: string;
  deciderName: string;
}

export interface ProjectState {
  workspaceId: string;
  objective: string;
  currentStatus: string;
  completed: string[];
  inProgress: string[];
  blocked: string[];
  openQuestions: string[];
  activeTasks: string[];
  activeWorkers: string[];
  recentDecisions: ProjectDecision[];
  relevantFiles: string[];
  nextDecision: string;
  updatedAt: string;
}

export interface ManagerHandoff {
  id: string;
  workspaceId: string;
  previousManagerId: string;
  previousManagerName: string;
  backupManagerId: string;
  backupManagerName: string;
  timestamp: string;
  reason: string;
  briefing: {
    objective: string;
    projectStateSummary: string;
    completedWork: string[];
    activeWork: string[];
    unfinishedWork: string[];
    blockedWork: string[];
    currentTasks: string[];
    activeWorkers: string[];
    recentDecisions: string[];
    relevantReports: string[];
    relevantFiles: string[];
    importantProjectHistory: string[];
    previousManagerOperatingContext: string;
    previousManagerStyleNote: string;
    nextExpectedDecision: string;
  };
  status: 'PREPARED' | 'ACKNOWLEDGED' | 'COMPLETED';
}

export type AvailabilityStatus =
  | 'RESPONDING'
  | 'WORKING'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_REQUIRED'
  | 'UNRESPONSIVE'
  | 'UNKNOWN';

export interface AvailabilityCheckRecord {
  id: string;
  targetAccountId: string;
  targetAccountName: string;
  role: WorkspaceRole;
  workspaceId: string;
  status: AvailabilityStatus;
  latencyMs: number;
  details: string;
  checkedAt: string;
  isOperational: boolean;
  stages?: {
    stage: string;
    status: string;
    timestamp: string;
  }[];
  isComplete?: boolean;
}

export type AvailabilityCheck = AvailabilityCheckRecord;

export interface InitialBriefing {
  workspaceId: string;
  workspaceName: string;
  objective: string;
  timestamp: string;
  contributions: {
    accountId: string;
    accountName: string;
    provider: string;
    readiness: string;
    relevantKnowledge?: string;
    workingStyle?: string;
    capabilities?: string[];
    sourcesAndDates?: string;
  }[];
  synthesizedNotes?: string;
}

export interface Workspace {
  id: string;
  name: string;
  objective: string;
  createdAt: string;
  updatedAt: string;
  managerAccountId: string;
  backupManagerAccountId?: string;
  callerAccountId?: string;
  filterAccountId?: string;
  workerAccountIds: string[];
  currentStatus: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'WAITING_DECISION';
  tags: string[];
}

export type MessagePresentationFormat = 'standard' | 'bracketed' | 'compact' | 'card';

export interface AppSettings {
  messagePresentationFormat: MessagePresentationFormat;
  enableRealCalls: boolean;
}

export interface ArchiveManifest {
  archiveVersion: string;
  exportedAt: string;
  workspaceId: string;
  workspaceName: string;
  objective: string;
  totalEvents: number;
  totalMessages: number;
  totalTasks: number;
  totalFiles: number;
  participants: {
    id: string;
    name: string;
    role: string;
    provider: string;
    status: string;
  }[];
  fileList: {
    id: string;
    name: string;
    type: string;
    size: string;
  }[];
}
