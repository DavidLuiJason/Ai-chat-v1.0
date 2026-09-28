import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { WorkspaceDetailView } from './WorkspaceDetailView.tsx';
import { Plus, FolderGit2, X, AlertCircle } from 'lucide-react';

export const WorkspacesView: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    accounts,
    createWorkspace,
    setActiveNav,
  } = useApp();

  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [mgrId, setMgrId] = useState(accounts[0]?.id || '');
  const [bkpId, setBkpId] = useState('');
  const [callerId, setCallerId] = useState('');
  const [filterId, setFilterId] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  const connectedAccounts = accounts.filter((a) => a.connectionStatus === 'CONNECTED');

  const handleOpenCreateModal = () => {
    if (connectedAccounts.length > 0) {
      setMgrId(connectedAccounts[0].id);
      setBkpId(connectedAccounts[1]?.id || '');
      setCallerId(connectedAccounts[2]?.id || connectedAccounts[0].id);
      setFilterId(connectedAccounts[3]?.id || connectedAccounts[0].id);
      setSelectedWorkerIds(connectedAccounts.map((a) => a.id));
    }
    setIsCreatingModal(true);
  };

  const handleToggleWorker = (accId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objective.trim() || !mgrId) return;

    const newWs = createWorkspace({
      name: name.trim(),
      objective: objective.trim(),
      managerAccountId: mgrId,
      backupManagerAccountId: bkpId || undefined,
      callerAccountId: callerId || mgrId,
      filterAccountId: filterId || mgrId,
      workerAccountIds: selectedWorkerIds.length > 0 ? selectedWorkerIds : [mgrId],
    });

    setName('');
    setObjective('');
    setIsCreatingModal(false);
    setActiveWorkspaceId(newWs.id);
  };

  // If a workspace is actively selected, show its detail view
  if (activeWorkspaceId) {
    return <WorkspaceDetailView />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/40">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Fleet Operations
          </div>
          <h1 className="text-base font-bold text-slate-900">Workspaces & Projects</h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {workspaces.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12 px-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No Workspaces Created</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create a workspace to assemble a multi-AI workforce with a dedicated Manager, Caller,
              Workers, and Filter.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Create Workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws) => {
                const mgr = accounts.find((a) => a.id === ws.managerAccountId);
                const bkp = accounts.find((a) => a.id === ws.backupManagerAccountId);

                return (
                  <div
                    key={ws.id}
                    onClick={() => setActiveWorkspaceId(ws.id)}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{ws.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {ws.currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ws.objective}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Manager:</span>
                        <span className="font-mono font-medium text-slate-900">
                          {mgr?.canonicalName || 'None'}
                        </span>
                      </div>
                      {bkp && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Backup:</span>
                          <span className="font-mono text-slate-700">{bkp.canonicalName}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Workers:</span>
                        <span className="font-mono">{ws.workerAccountIds.length} assigned</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* New Workspace Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-slate-900">Create Multi-AI Workspace</h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {connectedAccounts.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-900">No Connected AI Accounts</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You need at least one connected AI account to act as the primary Manager before creating a workspace.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsCreatingModal(false);
                      setActiveNav('ai-tools');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 cursor-pointer"
                  >
                    Go to AI Tools & Connect Account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Distributed Infrastructure Architecture"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Project Objective</label>
                  <textarea
                    required
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="High-level goal that the Manager will plan, delegate, and supervise..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Primary Manager (Decision Maker)
                    </label>
                    <select
                      value={mgrId}
                      onChange={(e) => setMgrId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                    >
                      {connectedAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.canonicalName} ({a.providerId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Designated Backup Manager (Optional)
                    </label>
                    <select
                      value={bkpId}
                      onChange={(e) => setBkpId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                    >
                      <option value="">None (Single Manager)</option>
                      {connectedAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.canonicalName} ({a.providerId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Caller (Dispatcher)
                    </label>
                    <select
                      value={callerId}
                      onChange={(e) => setCallerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                    >
                      <option value="">Manager Default</option>
                      {connectedAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.canonicalName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Filter (Report Compiler)
                    </label>
                    <select
                      value={filterId}
                      onChange={(e) => setFilterId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                    >
                      <option value="">Manager Default</option>
                      {connectedAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.canonicalName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Worker Pool Selection */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Assigned Workers ({selectedWorkerIds.length} selected)
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-slate-50/50">
                    {connectedAccounts.map((acc) => {
                      const isChecked = selectedWorkerIds.includes(acc.id);
                      return (
                        <label
                          key={acc.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWorker(acc.id)}
                            className="rounded text-slate-900 focus:ring-slate-900"
                          />
                          <span className="font-mono font-medium text-slate-900">
                            {acc.canonicalName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({acc.capabilities.slice(0, 2).join(', ')})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingModal(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    Initialize Workspace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
