import {
  AIAccount,
  Provider,
  Workspace,
  Task,
  Message,
  Attachment,
  ProjectState,
  FilterReport,
  AppSettings,
  AvailabilityCheckRecord,
  ManagerHandoff,
} from '../types/index.ts';
import { INITIAL_PROVIDERS } from './providerService.ts';

const STORAGE_KEYS = {
  PROVIDERS: 'aichat_v2_providers',
  ACCOUNTS: 'aichat_v2_accounts',
  WORKSPACES: 'aichat_v2_workspaces',
  TASKS: 'aichat_v2_tasks',
  MESSAGES: 'aichat_v2_messages',
  ATTACHMENTS: 'aichat_v2_attachments',
  PROJECT_STATES: 'aichat_v2_project_states',
  FILTER_REPORTS: 'aichat_v2_filter_reports',
  AVAILABILITY_LOGS: 'aichat_v2_availability_logs',
  MANAGER_HANDOFFS: 'aichat_v2_manager_handoffs',
  SETTINGS: 'aichat_v2_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  messagePresentationFormat: 'standard',
  enableRealCalls: true,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Storage error loading ${key}:`, err);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Storage error saving ${key}:`, err);
  }
}

export const StorageService = {
  getProviders(): Provider[] {
    return load<Provider[]>(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  },
  saveProviders(providers: Provider[]): void {
    save(STORAGE_KEYS.PROVIDERS, providers);
  },

  // Fresh install starts with EMPTY accounts!
  getAccounts(): AIAccount[] {
    return load<AIAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
  },
  saveAccounts(accounts: AIAccount[]): void {
    save(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  // Fresh install starts with EMPTY workspaces!
  getWorkspaces(): Workspace[] {
    return load<Workspace[]>(STORAGE_KEYS.WORKSPACES, []);
  },
  saveWorkspaces(workspaces: Workspace[]): void {
    save(STORAGE_KEYS.WORKSPACES, workspaces);
  },

  // Fresh install starts with EMPTY tasks!
  getTasks(): Task[] {
    return load<Task[]>(STORAGE_KEYS.TASKS, []);
  },
  saveTasks(tasks: Task[]): void {
    save(STORAGE_KEYS.TASKS, tasks);
  },

  // Fresh install starts with EMPTY messages!
  getMessages(): Message[] {
    return load<Message[]>(STORAGE_KEYS.MESSAGES, []);
  },
  saveMessages(messages: Message[]): void {
    save(STORAGE_KEYS.MESSAGES, messages);
  },

  // Fresh install starts with EMPTY attachments!
  getAttachments(): Attachment[] {
    return load<Attachment[]>(STORAGE_KEYS.ATTACHMENTS, []);
  },
  saveAttachments(attachments: Attachment[]): void {
    save(STORAGE_KEYS.ATTACHMENTS, attachments);
  },

  getProjectStates(): Record<string, ProjectState> {
    return load<Record<string, ProjectState>>(STORAGE_KEYS.PROJECT_STATES, {});
  },
  saveProjectStates(states: Record<string, ProjectState>): void {
    save(STORAGE_KEYS.PROJECT_STATES, states);
  },

  getFilterReports(): FilterReport[] {
    return load<FilterReport[]>(STORAGE_KEYS.FILTER_REPORTS, []);
  },
  saveFilterReports(reports: FilterReport[]): void {
    save(STORAGE_KEYS.FILTER_REPORTS, reports);
  },

  getAvailabilityLogs(): AvailabilityCheckRecord[] {
    return load<AvailabilityCheckRecord[]>(STORAGE_KEYS.AVAILABILITY_LOGS, []);
  },
  saveAvailabilityLogs(logs: AvailabilityCheckRecord[]): void {
    save(STORAGE_KEYS.AVAILABILITY_LOGS, logs);
  },

  getManagerHandoffs(): ManagerHandoff[] {
    return load<ManagerHandoff[]>(STORAGE_KEYS.MANAGER_HANDOFFS, []);
  },
  saveManagerHandoffs(handoffs: ManagerHandoff[]): void {
    save(STORAGE_KEYS.MANAGER_HANDOFFS, handoffs);
  },

  getSettings(): AppSettings {
    return load<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    save(STORAGE_KEYS.SETTINGS, settings);
  },

  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('aichat_provider_sequences_v2');
  },
};
