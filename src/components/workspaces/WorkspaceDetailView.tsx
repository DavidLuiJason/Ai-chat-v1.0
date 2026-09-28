import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessageItem } from '../common/MessageItem.tsx';
import { Attachment } from '../../types/index.ts';
import { AttachmentViewerModal } from '../common/AttachmentViewerModal.tsx';
import {
  MessageSquare,
  Activity,
  CheckSquare,
  FileText,
  Users,
  Archive,
  Send,
  Download,
  AlertCircle,
  Shield,
  HelpCircle,
} from 'lucide-react';

import { InitialBriefingModal } from './InitialBriefingModal.tsx';
import { InitialBriefing } from '../../types/index.ts';

export const WorkspaceDetailView: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    accounts,
    tasks,
    messages,
    attachments,
    projectStates,
    filterReports,
    settings,
    sendWorkspaceMessage,
    isProcessing,
    runAvailabilityCheck,
    initiateManagerHandoff,
    downloadArchiveZip,
    updateTaskStatus,
    updateWorkspace,
    createTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'chat' | 'activity' | 'tasks' | 'state' | 'team' | 'files' | 'archive'
  >('chat');
  const [inputText, setInputText] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWorkerId, setNewTaskWorkerId] = useState('');
  const [activeBriefing, setActiveBriefing] = useState<InitialBriefing | null>(null);

  const workspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  if (!workspace) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No workspace selected.</p>
      </div>
    );
  }

  const manager = accounts.find((a) => a.id === workspace.managerAccountId);
  const backupManager = accounts.find((a) => a.id === workspace.backupManagerAccountId);
  const caller = accounts.find((a) => a.id === workspace.callerAccountId);
  const filter = accounts.find((a) => a.id === workspace.filterAccountId);
  const workers = accounts.filter((a) => workspace.workerAccountIds.includes(a.id));

  const wsMessages = messages.filter((m) => m.workspaceId === workspace.id);
  const userFacingMessages = wsMessages.filter((m) => !m.isInternalWorkforce);
  const internalWorkforceMessages = wsMessages.filter((m) => m.isInternalWorkforce);

  const wsTasks = tasks.filter((t) => t.workspaceId === workspace.id);
  const wsState = projectStates[workspace.id];
  const wsAttachments = attachments.filter((a) => a.workspaceId === workspace.id);
  const latestFilterReport = filterReports.find((r) => r.workspaceId === workspace.id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const msg = inputText.trim();
    setInputText('');
    await sendWorkspaceMessage(workspace.id, msg);
  };

  const handleTriggerBriefing = () => {
    const briefing: InitialBriefing = {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      objective: workspace.objective,
      timestamp: new Date().toISOString(),
      contributions: workers.map((w) => ({
        accountId: w.id,
        accountName: w.canonicalName,
        provider: w.providerId,
        readiness: w.connectionStatus === 'CONNECTED' ? 'READY' : 'CREDENTIALS_REQUIRED',
        capabilities: w.capabilities,
        relevantKnowledge: w.friendlyDescription || 'General workforce specialist.',
        workingStyle: 'Autonomous execution per Caller dispatch.',
        sourcesAndDates: `Connected: ${new Date(w.connectedAt || Date.now()).toLocaleDateString()}`,
      })),
      synthesizedNotes: `Manager ${manager?.canonicalName || 'Active Manager'} has reviewed workforce readiness for: "${workspace.objective}".`,
    };
    setActiveBriefing(briefing);
  };

  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const targetWorker = newTaskWorkerId || workspace.workerAccountIds[0] || workspace.managerAccountId;
    createTask({
      workspaceId: workspace.id,
      title: newTaskTitle.trim(),
      description: 'User-directed autonomous task assignment',
      assignedWorkerId: targetWorker,
      priority: 'high',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/40">
      {/* Workspace Header & Metadata Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <button
                type="button"
                onClick={() => setActiveWorkspaceId(null)}
                className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer flex items-center gap-0.5"
              >
                ← Workspaces
              </button>
              <span>·</span>
              <span>ID: {workspace.id}</span>
              <span>·</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded text-[11px] font-medium border border-emerald-200">
                {workspace.currentStatus}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{workspace.name}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{workspace.objective}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerBriefing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Initial Briefing</span>
            </button>
            <button
              onClick={() => runAvailabilityCheck(workspace.managerAccountId, workspace.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Check Manager Availability</span>
            </button>
            <button
              onClick={() => downloadArchiveZip(workspace.id)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </button>
          </div>
        </div>

        {/* Squad Summary Line */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Manager:</span>{' '}
            <strong className="text-slate-900 font-mono">{manager?.canonicalName || 'None'}</strong>
          </div>
          <div>
            <span className="text-slate-400">Backup Manager:</span>{' '}
            <span className="text-slate-700 font-mono">{backupManager?.canonicalName || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-400">Caller:</span>{' '}
            <span className="text-slate-700 font-mono">{caller?.canonicalName || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-400">Filter:</span>{' '}
            <span className="text-slate-700 font-mono">{filter?.canonicalName || 'None'}</span>
          </div>
          <div>
            <span className="text-slate-400">Workers:</span>{' '}
            <span className="text-slate-700 font-mono">{workers.length} active</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Zero-pill, button tab controls) */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>User Conversation</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
            {userFacingMessages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Workforce Activity</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
            {internalWorkforceMessages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
            {wsTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('state')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'state'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Project State</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Squad & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Artifacts ({wsAttachments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'archive'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Complete Archive</span>
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* TAB 1: User Conversation */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto flex flex-col h-full">
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 mb-4 flex items-center justify-between">
              <span>
                <strong>User Conversation:</strong> Clean dialogue between you and Manager{' '}
                <strong>{manager?.canonicalName}</strong>. Detailed worker dispatches and reports are kept
                in <em>Workforce Activity</em>.
              </span>
              <button
                onClick={() => setActiveTab('activity')}
                className="underline font-semibold cursor-pointer shrink-0 ml-2"
              >
                View Activity →
              </button>
            </div>

            {/* Conversation Log */}
            <div className="space-y-3 flex-1 overflow-y-auto mb-4">
              {userFacingMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  format={settings.messagePresentationFormat}
                  onPreviewAttachment={(att) => setPreviewAttachment(att)}
                />
              ))}

              {isProcessing && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-xs text-blue-900 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                  <div>
                    <span className="font-semibold block">Workforce cycle in progress:</span>
                    <span className="text-slate-600">
                      Manager planning → Caller dispatching → Workers executing → Filter compiling report...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="shrink-0 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Instruct Manager ${manager?.canonicalName || 'Manager'}...`}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 shadow-2xs disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Instruct</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Workforce Activity (AI-to-AI Internal Loop) */}
        {activeTab === 'activity' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
              <span>
                <strong>Workforce Activity:</strong> Internal AI-to-AI communication between Caller{' '}
                <strong>{caller?.canonicalName}</strong>, assigned Workers, and Filter{' '}
                <strong>{filter?.canonicalName}</strong>.
              </span>
              <span className="font-mono text-slate-500">
                {internalWorkforceMessages.length} events logged
              </span>
            </div>

            {/* Latest Filter Report Feature Box */}
            {latestFilterReport && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Latest Structured Workforce Report
                    </span>
                    <span className="text-[11px] text-slate-500">
                      by {latestFilterReport.filterAccountName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(latestFilterReport.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="font-semibold text-emerald-800 block mb-1">
                      Completed ({latestFilterReport.completedTasks.length})
                    </span>
                    <ul className="space-y-1 text-slate-700">
                      {latestFilterReport.completedTasks.map((t, idx) => (
                        <li key={idx} className="text-[11px]">
                          <strong>{t.workerName}:</strong> {t.taskTitle}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="font-semibold text-amber-800 block mb-1">Requires Manager Decision</span>
                    <ul className="space-y-1 text-slate-700">
                      {latestFilterReport.requiresManagerDecision.map((d, idx) => (
                        <li key={idx} className="text-[11px]">
                          · {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Internal message stream */}
            <div className="space-y-3">
              {internalWorkforceMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  format={settings.messagePresentationFormat}
                  onPreviewAttachment={(att) => setPreviewAttachment(att)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Tasks */}
        {activeTab === 'tasks' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Quick Task Dispatch Form */}
            <form onSubmit={handleCreateManualTask} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Assign manual task to a specific worker..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500 w-full"
              />
              <select
                value={newTaskWorkerId}
                onChange={(e) => setNewTaskWorkerId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="">Select Worker</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.canonicalName}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                Create Task
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-3">
              {wsTasks.map((task) => {
                const assignedAccount = accounts.find((a) => a.id === task.assignedWorkerId);
                return (
                  <div
                    key={task.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{task.id}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">{task.title}</span>
                      </div>
                      <p className="text-slate-600">{task.description}</p>
                      {task.resultSummary && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          Result: {task.resultSummary}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <span>Assigned: {assignedAccount?.canonicalName || 'Worker'}</span>
                        <span>·</span>
                        <span>Priority: {task.priority}</span>
                      </div>
                    </div>

                    {/* Task status control */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-hidden cursor-pointer ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : task.status === 'WORKING'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="QUEUED">QUEUED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="WORKING">WORKING</option>
                        <option value="WAITING">WAITING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Project State */}
        {activeTab === 'state' && wsState && (
          <div className="max-w-4xl mx-auto space-y-5 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Living Project State
                </span>
                <h3 className="text-base font-bold text-slate-900">{wsState.objective}</h3>
                <p className="text-slate-600 mt-1">{wsState.currentStatus}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-emerald-800 block mb-2 text-xs uppercase tracking-wider">
                    Completed Milestones
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {wsState.completed.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-blue-800 block mb-2 text-xs uppercase tracking-wider">
                    Next Required Decision
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">{wsState.nextDecision}</p>
                  <div className="mt-3 text-slate-500">
                    Active Workers in flight: {wsState.activeWorkers.join(', ') || 'All stand by'}
                  </div>
                </div>
              </div>

              {/* Recent Decisions */}
              <div className="pt-2">
                <span className="font-semibold text-slate-900 block mb-2">Recent Manager Decisions</span>
                <div className="space-y-2">
                  {wsState.recentDecisions.map((dec, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-800 font-mono">[{dec.deciderName}]:</span>{' '}
                        <span className="text-slate-700">{dec.decision}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {new Date(dec.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Team Configuration & Roles */}
        {activeTab === 'team' && (
          <div className="max-w-4xl mx-auto space-y-5 text-xs">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workforce Configuration</h3>
                <p className="text-slate-500 mt-0.5">
                  Configure primary leadership, designated backup, caller routing, and filter roles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Manager */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Active Manager</span>
                    <button
                      onClick={() => initiateManagerHandoff(workspace.id, 'User manual failover test')}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-medium underline cursor-pointer"
                    >
                      Trigger Handoff
                    </button>
                  </div>
                  <select
                    value={workspace.managerAccountId}
                    onChange={(e) => updateWorkspace(workspace.id, { managerAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.canonicalName} ({acc.capabilities.slice(0, 2).join(', ')})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Primary decision maker & planner. Evaluates workforce reports and sets direction.
                  </p>
                </div>

                {/* Backup Manager */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-900 block">Designated Backup Manager</span>
                  <select
                    value={workspace.backupManagerAccountId}
                    onChange={(e) => updateWorkspace(workspace.id, { backupManagerAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.canonicalName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Maintains live state context. Activated immediately if primary manager becomes unresponsive.
                  </p>
                </div>

                {/* Caller */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-900 block">Caller (Dispatcher)</span>
                  <select
                    value={workspace.callerAccountId}
                    onChange={(e) => updateWorkspace(workspace.id, { callerAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.canonicalName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Coordinates communications, dispatches requests, and monitors worker response timing.
                  </p>
                </div>

                {/* Filter */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="font-bold text-slate-900 block">Filter (Report Compiler)</span>
                  <select
                    value={workspace.filterAccountId}
                    onChange={(e) => updateWorkspace(workspace.id, { filterAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.canonicalName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Compiles structured workforce reports without summarizing away important worker details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Files & Artifacts */}
        {activeTab === 'files' && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {wsAttachments.map((att) => (
                <div
                  key={att.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="uppercase font-mono">{att.fileType}</span>
                      <span>{att.formattedSize}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 block truncate" title={att.name}>
                      {att.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      By {att.creatorName || 'Worker'}
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setPreviewAttachment(att)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([att.contentPreview || ''], { type: att.mimeType });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = att.name;
                        a.click();
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: Complete Archive */}
        {activeTab === 'archive' && (
          <div className="max-w-4xl mx-auto space-y-4 text-xs">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Archive Manifest</h3>
                <p className="text-slate-500 mt-1">
                  Immutable chronological record of every message, event, task state, and generated artifact.
                </p>
              </div>
              <button
                onClick={() => downloadArchiveZip(workspace.id)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Entire Archive (ZIP)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto space-y-2">
              <div className="text-emerald-400 font-bold mb-2"># ARCHIVE EVENT LOG (Chronological)</div>
              {wsMessages.map((m, i) => (
                <div key={m.id} className="leading-relaxed border-b border-slate-800 pb-1.5 last:border-b-0">
                  <span className="text-slate-500">[{i + 1}]</span>{' '}
                  <span className="text-blue-400">[{new Date(m.timestamp).toISOString()}]</span>{' '}
                  <span className="text-amber-400">[{m.messageType}]</span>{' '}
                  <span className="font-bold text-white">{m.accountIdentity || m.senderName}:</span>{' '}
                  <span className="text-slate-300">{m.content.slice(0, 100)}...</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attachment Preview Modal */}
      <AttachmentViewerModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Initial Briefing Modal */}
      <InitialBriefingModal
        briefing={activeBriefing}
        onClose={() => setActiveBriefing(null)}
      />
    </div>
  );
};
