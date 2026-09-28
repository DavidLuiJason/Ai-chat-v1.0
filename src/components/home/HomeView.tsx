import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FolderGit2,
  Users2,
  CheckCircle2,
  ArrowRight,
  Plus,
  Cpu,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface HomeViewProps {
  onOpenAddAccount: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenAddAccount }) => {
  const {
    workspaces,
    accounts,
    tasks,
    setActiveNav,
    setActiveWorkspaceId,
  } = useApp();

  const connectedAccounts = accounts.filter((a) => a.connectionStatus === 'CONNECTED');
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const activeTasksCount = tasks.filter((t) => t.status === 'WORKING' || t.status === 'ASSIGNED').length;

  const handleLaunchWorkspace = (wsId: string) => {
    setActiveWorkspaceId(wsId);
    setActiveNav('workspaces');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Hero Welcome */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-2xs">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5">
            Multi-AI Workforce Platform
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Chat Fleet Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Coordinate multiple AI accounts into dedicated Managers, Callers, Workers, and Filters.
            Assign tasks, inspect worker reports, and preserve complete project history with authentic verification.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddAccount}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect AI Account</span>
            </button>

            {workspaces.length > 0 ? (
              <button
                onClick={() => handleLaunchWorkspace(workspaces[0].id)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Open {workspaces[0].name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setActiveNav('workspaces')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Create Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Connected</span>
            <Users2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{connectedAccounts.length}</div>
          <div className="text-[10px] text-slate-400">Verified AI Accounts</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Workspaces</span>
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{workspaces.length}</div>
          <div className="text-[10px] text-slate-400">Active Projects</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Tasks Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{completedTasksCount}</div>
          <div className="text-[10px] text-slate-400">Archived Results</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">In Progress</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{activeTasksCount}</div>
          <div className="text-[10px] text-slate-400">Active Dispatches</div>
        </div>
      </div>

      {/* Fresh Installation Guide / Workspaces List */}
      {workspaces.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Getting Started with Your Workforce</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="font-semibold text-slate-900">Connect AI Accounts</div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Connect Google AI Studio, Gemini, ChatGPT, Claude, or Grok using real verified credentials.
              </p>
              <button
                onClick={onOpenAddAccount}
                className="text-slate-900 font-medium hover:underline text-[11px] inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Connect Account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="font-semibold text-slate-900">Create a Workspace</div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Assign an active Manager, optional Backup Manager, Caller, and specialized Workers for your objective.
              </p>
              <button
                onClick={() => setActiveNav('workspaces')}
                className="text-slate-900 font-medium hover:underline text-[11px] inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Go to Workspaces</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="font-semibold text-slate-900">Execute & Archive</div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Send objectives. The Manager plans and assigns tasks through the Caller, and the Filter aggregates reports.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Active Workspaces</h2>
            <button
              onClick={() => setActiveNav('workspaces')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {workspaces.map((ws) => {
              const manager = accounts.find((a) => a.id === ws.managerAccountId);
              const wsTasks = tasks.filter((t) => t.workspaceId === ws.id);
              return (
                <div
                  key={ws.id}
                  onClick={() => handleLaunchWorkspace(ws.id)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <span>{ws.name}</span>
                      {manager && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          Manager: {manager.canonicalName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{ws.objective}</div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {wsTasks.length} tasks
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
