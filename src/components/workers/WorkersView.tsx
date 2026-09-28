import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessageSquare, Users, Cpu, ArrowRight } from 'lucide-react';
import { WorkerAvailability } from '../../types/index.ts';

export const WorkersView: React.FC = () => {
  const { accounts, tasks, workspaces, setDirectChatAccountId, setActiveNav } = useApp();
  const [filterAvailability, setFilterAvailability] = useState<string>('ALL');

  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-sm font-semibold text-slate-900">No Workers Connected</h2>
          <p className="text-xs text-slate-500">
            Connect AI accounts with authentic credentials to populate your workforce worker pool.
          </p>
          <button
            onClick={() => setActiveNav('ai-tools')}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Connect AI Accounts
          </button>
        </div>
      </div>
    );
  }

  const filteredAccounts = accounts.filter((a) => {
    if (filterAvailability === 'ALL') return true;
    return a.availability === filterAvailability;
  });

  const getStatusColor = (status: WorkerAvailability) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WORKING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'WAITING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'UNAVAILABLE':
        return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'ERROR':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const handleDirectChat = (accId: string) => {
    setDirectChatAccountId(accId);
    setActiveNav('direct-chats');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Worker Roster
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Workers</h1>
          <p className="text-xs text-slate-600 mt-1">
            Individual AI accounts performing assignments and artifact compilation.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start text-xs shadow-2xs">
          {['ALL', 'AVAILABLE', 'WORKING', 'WAITING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterAvailability(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterAvailability === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Workers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((worker) => {
          const assignedTasks = tasks.filter((t) => t.assignedWorkerId === worker.id);
          const activeTasks = assignedTasks.filter((t) => t.status === 'WORKING');
          const completedTasks = assignedTasks.filter((t) => t.status === 'COMPLETED');
          const assignedWorkspaces = workspaces.filter(
            (w) => w.workerAccountIds.includes(worker.id) || w.managerAccountId === worker.id
          );

          return (
            <div
              key={worker.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-slate-500" />
                      <span>{worker.canonicalName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Account #{worker.identityNumber} · {worker.providerId}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getStatusColor(
                      worker.availability
                    )}`}
                  >
                    {worker.availability}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-normal line-clamp-2">
                  {worker.friendlyDescription || 'General workforce execution specialist.'}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {worker.capabilities.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 bg-slate-50/70 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Completed Tasks</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {completedTasks.length}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50/70 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Workspaces</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {assignedWorkspaces.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeTasks.length > 0 ? `${activeTasks.length} active task` : 'Idle'}
                </span>

                <button
                  onClick={() => handleDirectChat(worker.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
