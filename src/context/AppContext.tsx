import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Provider,
  AIAccount,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  AppSettings,
  AvailabilityCheckRecord,
  ManagerHandoff,
  AuthType,
  TaskStatus,
} from '../types/index.ts';
import { StorageService, DEFAULT_SETTINGS } from '../services/storageService.ts';
import {
  getNextSequentialNumber,
  generateCanonicalName,
  verifyProviderConnection,
  executeProviderPrompt,
} from '../services/providerService.ts';
import {
  executeWorkforceCycle,
  buildManagerHandoff,
  performRealAvailabilityCheck,
  getNextTaskId,
} from '../services/orchestrationService.ts';
import { exportProjectArchiveZip, downloadBlobAsFile } from '../services/archiveService.ts';

export type NavView =
  | 'home'
  | 'workspaces'
  | 'ai-tools'
  | 'workers'
  | 'managers'
  | 'direct-chats'
  | 'files'
  | 'settings';

interface AppContextType {
  activeNav: NavView;
  setActiveNav: (nav: NavView) => void;

  // Mobile navigation drawer state (CLOSED by default!)
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

  // Data collections (start EMPTY on fresh install)
  providers: Provider[];
  accounts: AIAccount[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;

  tasks: Task[];
  messages: Message[];
  attachments: Attachment[];
  projectStates: Record<string, ProjectState>;
  filterReports: FilterReport[];
  availabilityLogs: AvailabilityCheckRecord[];
  managerHandoffs: ManagerHandoff[];
  settings: AppSettings;

  directChatAccountId: string | null;
  setDirectChatAccountId: (id: string | null) => void;

  isProcessing: boolean;
  activeHandoffModal: ManagerHandoff | null;
  setActiveHandoffModal: (handoff: ManagerHandoff | null) => void;
  activeAvailabilityModal: AvailabilityCheckRecord | null;
  setActiveAvailabilityModal: (check: AvailabilityCheckRecord | null) => void;

  // Operations
  connectAccount: (params: {
    providerId: string;
    authType: AuthType;
    apiKey?: string;
    friendlyDescription?: string;
    capabilities?: string[];
  }) => Promise<{ success: boolean; account?: AIAccount; error?: string }>;

  removeAccount: (accountId: string) => void;

  createWorkspace: (params: {
    name: string;
    objective: string;
    managerAccountId: string;
    backupManagerAccountId?: string;
    callerAccountId?: string;
    filterAccountId?: string;
    workerAccountIds: string[];
    tags?: string[];
  }) => Workspace;

  removeWorkspace: (workspaceId: string) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;

  createTask: (params: {
    workspaceId: string;
    title: string;
    description: string;
    assignedWorkerId: string;
    priority?: 'low' | 'medium' | 'high';
  }) => Task;

  updateTaskStatus: (taskId: string, status: TaskStatus, resultSummary?: string) => void;

  sendWorkspaceMessage: (workspaceId: string, content: string) => Promise<void>;
  sendDirectChatMessage: (accountId: string, content: string) => Promise<void>;

  runAvailabilityCheck: (accountId: string, workspaceId: string) => Promise<AvailabilityCheckRecord>;

  initiateManagerHandoff: (workspaceId: string, reason: string) => void;
  confirmManagerHandoff: (handoffId: string) => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  downloadArchiveZip: (workspaceId: string) => Promise<void>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeNav, setActiveNav] = useState<NavView>('home');
  // Closed by default on mobile!
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [providers, setProviders] = useState<Provider[]>(() => StorageService.getProviders());
  const [accounts, setAccounts] = useState<AIAccount[]>(() => StorageService.getAccounts());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.getWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    const list = StorageService.getWorkspaces();
    return list.length > 0 ? list[0].id : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [messages, setMessages] = useState<Message[]>(() => StorageService.getMessages());
  const [attachments, setAttachments] = useState<Attachment[]>(() => StorageService.getAttachments());
  const [projectStates, setProjectStates] = useState<Record<string, ProjectState>>(() =>
    StorageService.getProjectStates()
  );
  const [filterReports, setFilterReports] = useState<FilterReport[]>(() =>
    StorageService.getFilterReports()
  );
  const [availabilityLogs, setAvailabilityLogs] = useState<AvailabilityCheckRecord[]>(() =>
    StorageService.getAvailabilityLogs()
  );
  const [managerHandoffs, setManagerHandoffs] = useState<ManagerHandoff[]>(() =>
    StorageService.getManagerHandoffs()
  );
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  const [directChatAccountId, setDirectChatAccountId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeHandoffModal, setActiveHandoffModal] = useState<ManagerHandoff | null>(null);
  const [activeAvailabilityModal, setActiveAvailabilityModal] =
    useState<AvailabilityCheckRecord | null>(null);

  // Sync state to storage
  useEffect(() => StorageService.saveProviders(providers), [providers]);
  useEffect(() => StorageService.saveAccounts(accounts), [accounts]);
  useEffect(() => StorageService.saveWorkspaces(workspaces), [workspaces]);
  useEffect(() => StorageService.saveTasks(tasks), [tasks]);
  useEffect(() => StorageService.saveMessages(messages), [messages]);
  useEffect(() => StorageService.saveAttachments(attachments), [attachments]);
  useEffect(() => StorageService.saveProjectStates(projectStates), [projectStates]);
  useEffect(() => StorageService.saveFilterReports(filterReports), [filterReports]);
  useEffect(() => StorageService.saveAvailabilityLogs(availabilityLogs), [availabilityLogs]);
  useEffect(() => StorageService.saveManagerHandoffs(managerHandoffs), [managerHandoffs]);
  useEffect(() => StorageService.saveSettings(settings), [settings]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  // 1. Connect Account (REAL VERIFICATION. NEVER FAKE CONNECTED)
  const connectAccount = useCallback(
    async (params: {
      providerId: string;
      authType: AuthType;
      apiKey?: string;
      friendlyDescription?: string;
      capabilities?: string[];
    }) => {
      const provider = providers.find((p) => p.id === params.providerId);
      if (!provider) {
        return { success: false, error: 'Unknown provider requested.' };
      }

      // Real check against backend
      const verification = await verifyProviderConnection({
        providerId: provider.id,
        authType: params.authType,
        apiKey: params.apiKey,
      });

      if (!verification.success) {
        return {
          success: false,
          error: verification.error || 'Provider authentication failed. Check credentials.',
        };
      }

      // Compute sequential number that is NEVER reused
      const identityNumber = getNextSequentialNumber(provider.id);
      const canonicalName = generateCanonicalName(provider.name, identityNumber);

      const newAccount: AIAccount = {
        id: `acc-${provider.id}-${identityNumber}-${Date.now()}`,
        providerId: provider.id,
        canonicalName,
        identityNumber,
        friendlyDescription:
          params.friendlyDescription || `${canonicalName} Operational Specialist`,
        authType: params.authType,
        connectionStatus: 'CONNECTED',
        capabilities:
          params.capabilities && params.capabilities.length > 0
            ? params.capabilities
            : ['Reasoning', 'Code Analysis', 'Workflow Execution'],
        availability: 'AVAILABLE',
        totalTasksCompleted: 0,
        filesProducedCount: 0,
        connectedAt: new Date().toISOString(),
        apiKey: params.apiKey,
        isRemoved: false,
      };

      setAccounts((prev) => [...prev, newAccount]);
      return { success: true, account: newAccount };
    },
    [providers]
  );

  // 2. Remove / Disconnect Account
  const removeAccount = useCallback((accountId: string) => {
    // Unassign from active workspaces
    setWorkspaces((prev) =>
      prev.map((ws) => {
        let updated = false;
        const copy = { ...ws };
        if (copy.managerAccountId === accountId) {
          copy.managerAccountId = copy.backupManagerAccountId || '';
          updated = true;
        }
        if (copy.backupManagerAccountId === accountId) {
          copy.backupManagerAccountId = undefined;
          updated = true;
        }
        if (copy.callerAccountId === accountId) {
          copy.callerAccountId = undefined;
          updated = true;
        }
        if (copy.filterAccountId === accountId) {
          copy.filterAccountId = undefined;
          updated = true;
        }
        if (copy.workerAccountIds.includes(accountId)) {
          copy.workerAccountIds = copy.workerAccountIds.filter((id) => id !== accountId);
          updated = true;
        }
        return updated ? copy : ws;
      })
    );

    // Remove from active accounts list, mark as removed in historical record
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));

    // Update historical messages to indicate account disconnected, but PRESERVE the history!
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === accountId
          ? { ...m, isAccountRemoved: true }
          : m
      )
    );
  }, []);

  // 3. Create Workspace
  const createWorkspace = useCallback(
    (params: {
      name: string;
      objective: string;
      managerAccountId: string;
      backupManagerAccountId?: string;
      callerAccountId?: string;
      filterAccountId?: string;
      workerAccountIds: string[];
      tags?: string[];
    }) => {
      const newWsId = `ws-${Date.now()}`;
      const newWs: Workspace = {
        id: newWsId,
        name: params.name,
        objective: params.objective,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        managerAccountId: params.managerAccountId,
        backupManagerAccountId: params.backupManagerAccountId,
        callerAccountId: params.callerAccountId || params.managerAccountId,
        filterAccountId: params.filterAccountId || params.managerAccountId,
        workerAccountIds: params.workerAccountIds,
        currentStatus: 'ACTIVE',
        tags: params.tags || ['Workforce'],
      };

      const initialState: ProjectState = {
        workspaceId: newWsId,
        objective: params.objective,
        currentStatus: 'Workspace initialized. Manager awaiting directives.',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [
          {
            timestamp: new Date().toISOString(),
            decision: `Assembled workforce team for "${params.name}".`,
            deciderId: params.managerAccountId,
            deciderName:
              accounts.find((a) => a.id === params.managerAccountId)?.canonicalName || 'Manager',
          },
        ],
        relevantFiles: [],
        nextDecision: 'Decompose initial objective and assign primary tasks.',
        updatedAt: new Date().toISOString(),
      };

      setWorkspaces((prev) => [newWs, ...prev]);
      setProjectStates((prev) => ({ ...prev, [newWsId]: initialState }));
      setActiveWorkspaceId(newWsId);
      return newWs;
    },
    [accounts]
  );

  const removeWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
    setActiveWorkspaceId((curr) => (curr === workspaceId ? null : curr));
  }, []);

  const updateWorkspace = useCallback((workspaceId: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, ...updates, updatedAt: new Date().toISOString() } : ws))
    );
  }, []);

  // 4. Create Task
  const createTask = useCallback(
    (params: {
      workspaceId: string;
      title: string;
      description: string;
      assignedWorkerId: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      const newTaskId = getNextTaskId(tasks);
      const newTask: Task = {
        id: newTaskId,
        workspaceId: params.workspaceId,
        title: params.title,
        description: params.description,
        assignedWorkerId: params.assignedWorkerId,
        status: 'ASSIGNED',
        priority: params.priority || 'medium',
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [tasks]
  );

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, resultSummary?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              resultSummary: resultSummary || t.resultSummary,
              completedAt: status === 'COMPLETED' ? new Date().toISOString() : t.completedAt,
            }
          : t
      )
    );
  }, []);

  // 5. Send Workspace Message (Real Execution)
  const sendWorkspaceMessage = useCallback(
    async (workspaceId: string, content: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId] || {
        workspaceId,
        objective: workspace.objective,
        currentStatus: 'Active',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [],
        relevantFiles: [],
        nextDecision: '',
        updatedAt: new Date().toISOString(),
      };

      setIsProcessing(true);

      try {
        const result = await executeWorkforceCycle({
          workspace,
          userPrompt: content,
          accounts,
          existingTasks: wsTasks,
          existingState: wsState,
        });

        setMessages((prev) => [...prev, ...result.newMessages]);
        setTasks((prev) => [...prev, ...result.newTasks]);
        setAttachments((prev) => [...prev, ...result.newAttachments]);
        setFilterReports((prev) => [result.filterReport, ...prev]);
        setProjectStates((prev) => ({
          ...prev,
          [workspaceId]: result.updatedProjectState,
        }));
      } catch (err: any) {
        console.error('Workforce cycle execution error:', err);
        const errorMsg: Message = {
          id: `msg-${Date.now()}-error`,
          workspaceId,
          senderId: 'SYSTEM',
          senderName: 'System Engine',
          senderRole: 'SYSTEM',
          senderType: 'SYSTEM',
          content: `Execution error: ${err?.message || 'Failed to complete workforce cycle.'}`,
          attachments: [],
          messageType: 'AVAILABILITY_ALERT',
          isInternalWorkforce: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsProcessing(false);
      }
    },
    [workspaces, tasks, projectStates, accounts]
  );

  // 6. Direct Chat
  const sendDirectChatMessage = useCallback(
    async (accountId: string, content: string) => {
      const targetAccount = accounts.find((a) => a.id === accountId);
      if (!targetAccount) return;

      const userMsg: Message = {
        id: `msg-${Date.now()}-dc-user`,
        directChatAccountId: accountId,
        senderId: 'USER',
        senderName: 'User',
        senderRole: 'USER',
        senderType: 'USER',
        content,
        attachments: [],
        messageType: 'DIRECT_CHAT',
        isInternalWorkforce: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);

      try {
        const aiResponse = await executeProviderPrompt({
          account: targetAccount,
          prompt: content,
          systemInstruction: `You are ${targetAccount.canonicalName}. Capabilities: ${targetAccount.capabilities.join(', ')}. Answer the user directly, concisely, and maintain your identity.`,
        });

        const replyText =
          aiResponse.text ||
          aiResponse.error ||
          `Direct message received by ${targetAccount.canonicalName}.`;

        const aiMsg: Message = {
          id: `msg-${Date.now()}-dc-ai`,
          directChatAccountId: accountId,
          senderId: targetAccount.id,
          senderName: targetAccount.canonicalName,
          senderRole: 'DIRECT_RECIPIENT',
          senderType: 'WORKER',
          provider: targetAccount.canonicalName.split(' ')[0],
          accountIdentity: targetAccount.canonicalName,
          content: replyText,
          attachments: [],
          messageType: 'DIRECT_CHAT',
          isInternalWorkforce: false,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsProcessing(false);
      }
    },
    [accounts]
  );

  // 7. Real Availability Check
  const runAvailabilityCheck = useCallback(
    async (accountId: string, workspaceId: string) => {
      const targetAccount = accounts.find((a) => a.id === accountId);
      if (!targetAccount) {
        throw new Error('Account not found');
      }

      const workspace = workspaces.find((w) => w.id === workspaceId);
      let role: any = 'WORKER';
      if (workspace) {
        if (targetAccount.id === workspace.managerAccountId) role = 'MANAGER';
        else if (targetAccount.id === workspace.backupManagerAccountId) role = 'BACKUP_MANAGER';
        else if (targetAccount.id === workspace.callerAccountId) role = 'CALLER';
        else if (targetAccount.id === workspace.filterAccountId) role = 'FILTER';
      }

      const record = await performRealAvailabilityCheck(targetAccount, role, workspaceId);
      setAvailabilityLogs((prev) => [record, ...prev]);
      setActiveAvailabilityModal(record);
      return record;
    },
    [accounts, workspaces]
  );

  // 8. Manager Failover & Handoff
  const initiateManagerHandoff = useCallback(
    (workspaceId: string, reason: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const currentMgr = accounts.find((a) => a.id === workspace.managerAccountId);
      const backupMgr = accounts.find((a) => a.id === workspace.backupManagerAccountId);

      if (!currentMgr || !backupMgr) {
        alert('Both an active Manager and designated Backup Manager are required for failover.');
        return;
      }

      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId] || {
        workspaceId,
        objective: workspace.objective,
        currentStatus: 'Active',
        completed: [],
        inProgress: [],
        blocked: [],
        openQuestions: [],
        activeTasks: [],
        activeWorkers: [],
        recentDecisions: [],
        relevantFiles: [],
        nextDecision: '',
        updatedAt: new Date().toISOString(),
      };
      const wsMessages = messages.filter((m) => m.workspaceId === workspaceId);
      const wsReports = filterReports.filter((r) => r.workspaceId === workspaceId);

      const handoff = buildManagerHandoff({
        workspace,
        currentManager: currentMgr,
        backupManager: backupMgr,
        projectState: wsState,
        tasks: wsTasks,
        recentMessages: wsMessages,
        recentReports: wsReports,
        reason,
      });

      setActiveHandoffModal(handoff);
      setManagerHandoffs((prev) => [handoff, ...prev]);
    },
    [workspaces, accounts, tasks, projectStates, messages, filterReports]
  );

  const confirmManagerHandoff = useCallback(
    (handoffId: string) => {
      const handoff = managerHandoffs.find((h) => h.id === handoffId) || activeHandoffModal;
      if (!handoff) return;

      const workspace = workspaces.find((w) => w.id === handoff.workspaceId);
      if (!workspace) return;

      // Swap roles: Backup Manager becomes Active Manager
      // PRESERVES canonical identity of the new manager!
      updateWorkspace(workspace.id, {
        managerAccountId: handoff.backupManagerId,
        backupManagerAccountId: handoff.previousManagerId,
      });

      const handoffMsg: Message = {
        id: `msg-${Date.now()}-handoff`,
        workspaceId: workspace.id,
        senderId: 'SYSTEM',
        senderName: 'Workforce Runtime',
        senderRole: 'SYSTEM',
        senderType: 'SYSTEM',
        content: `MANAGER HANDOFF EXECUTED: ${handoff.previousManagerName} replaced by ${handoff.backupManagerName}.\nReason: ${handoff.reason}.\nBriefing delivered with complete project context. ${handoff.backupManagerName} has assumed active managerial authority.`,
        attachments: [],
        messageType: 'HANDOFF_EVENT',
        isInternalWorkforce: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, handoffMsg]);
      setManagerHandoffs((prev) =>
        prev.map((h) => (h.id === handoffId ? { ...h, status: 'COMPLETED' } : h))
      );
      setActiveHandoffModal(null);
    },
    [managerHandoffs, activeHandoffModal, workspaces, updateWorkspace]
  );

  // 9. Download ZIP
  const downloadArchiveZip = useCallback(
    async (workspaceId: string) => {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      if (!workspace) return;

      const wsMessages = messages.filter((m) => m.workspaceId === workspaceId);
      const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
      const wsAttachments = attachments.filter((a) => a.workspaceId === workspaceId);
      const wsState = projectStates[workspaceId];
      const wsReports = filterReports.filter((r) => r.workspaceId === workspaceId);

      const zipBlob = await exportProjectArchiveZip({
        workspace,
        messages: wsMessages,
        tasks: wsTasks,
        attachments: wsAttachments,
        projectState: wsState,
        filterReports: wsReports,
        accounts,
      });

      const safeName = workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlobAsFile(zipBlob, `${safeName}-archive.zip`);
    },
    [workspaces, messages, tasks, attachments, projectStates, filterReports, accounts]
  );

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetAllData = useCallback(() => {
    StorageService.resetAll();
    setProviders(StorageService.getProviders());
    setAccounts([]);
    setWorkspaces([]);
    setTasks([]);
    setMessages([]);
    setAttachments([]);
    setProjectStates({});
    setFilterReports([]);
    setAvailabilityLogs([]);
    setManagerHandoffs([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveWorkspaceId(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeNav,
        setActiveNav,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        providers,
        accounts,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        tasks,
        messages,
        attachments,
        projectStates,
        filterReports,
        availabilityLogs,
        managerHandoffs,
        settings,
        directChatAccountId,
        setDirectChatAccountId,
        isProcessing,
        activeHandoffModal,
        setActiveHandoffModal,
        activeAvailabilityModal,
        setActiveAvailabilityModal,

        connectAccount,
        removeAccount,
        createWorkspace,
        removeWorkspace,
        updateWorkspace,
        createTask,
        updateTaskStatus,
        sendWorkspaceMessage,
        sendDirectChatMessage,
        runAvailabilityCheck,
        initiateManagerHandoff,
        confirmManagerHandoff,
        updateSettings,
        downloadArchiveZip,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
