import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Shield, ShieldAlert, ArrowRight, RefreshCw, Users, FolderGit2 } from 'lucide-react';

export const ManagersView: React.FC = () => {
  const {
    workspaces,
    accounts,
    tasks,
    setActiveWorkspaceId,
    setActiveNav,
    runAvailabilityCheck,
    initiateManagerHandoff,
  } = useApp();

  if (workspaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-sm font-semibold text-slate-900">No Workspaces Configured</h2>
          <p className="text-xs text-slate-500">
            Create a workspace to assemble a management squad with a Primary Manager, Backup Manager, Caller, and Filter.
          </p>
          <button
            onClick={() => setActiveNav('workspaces')}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Create Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Workforce Leadership
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Workforce Managers & Squads
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          The Manager is the primary decision-maker and planner. Every active Manager can maintain a
          designated Backup Manager ready for seamless handoff with zero state amnesia.
        </p>
      </div>

      {/* Squad Cards List */}
      <div className="space-y-6">
        {workspaces.map((ws) => {
          const mgr = accounts.find((a) => a.id === ws.managerAccountId);
          const bkp = accounts.find((a) => a.id === ws.backupManagerAccountId);
          const caller = accounts.find((a) => a.id === ws.callerAccountId);
          const filter = accounts.find((a) => a.id === ws.filterAccountId);
          const assignedWorkers = accounts.filter((a) => ws.workerAccountIds.includes(a.id));
          const wsTasks = tasks.filter((t) => t.workspaceId === ws.id);

          return (
            <div
              key={ws.id}
              className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-5"
            >
              {/* Workspace Leadership Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono mb-0.5">
                    WORKSPACE: {ws.name}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{ws.name}</h2>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{ws.objective}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setActiveNav('workspaces');
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Leadership Roles Diagram & Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Primary Manager */}
                <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-900 text-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-300">
                      Primary Manager
                    </span>
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold font-mono truncate">{mgr?.canonicalName || 'None Assigned'}</div>
                  <p className="text-[11px] text-slate-300">
                    Primary decision maker & planner. Steers workforce tasks.
                  </p>
                  {mgr && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => runAvailabilityCheck(mgr.id, ws.id)}
                        className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        Audit Availability
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Backup Manager */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Designated Backup
                    </span>
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 truncate">
                    {bkp?.canonicalName || 'None Assigned'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Maintains live shadow state. Ready for immediate handoff.
                  </p>
                  {bkp && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() =>
                          initiateManagerHandoff(ws.id, 'Manual simulation of primary manager interruption')
                        }
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline cursor-pointer"
                      >
                        Trigger Handoff
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Caller */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Caller (Dispatcher)
                    </span>
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 truncate">
                    {caller?.canonicalName || mgr?.canonicalName || 'Manager Default'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Routes tasks, monitors response timing, and alerts Manager.
                  </p>
                </div>

                {/* 4. Filter */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                      Filter (Compiler)
                    </span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 truncate">
                    {filter?.canonicalName || 'Manager Default'}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Builds structured workforce reports preserving attribution.
                  </p>
                </div>
              </div>

              {/* Workers Assigned */}
              <div className="pt-2 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">Assigned Workers:</span>
                {assignedWorkers.length > 0 ? (
                  assignedWorkers.map((w) => (
                    <span
                      key={w.id}
                      className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[11px] border border-slate-200"
                    >
                      {w.canonicalName}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No dedicated workers assigned</span>
                )}
                <span className="text-slate-400 ml-auto font-mono text-[11px]">
                  {wsTasks.length} tasks
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
