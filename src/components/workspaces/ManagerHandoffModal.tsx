import React from 'react';
import { ManagerHandoff } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface ManagerHandoffModalProps {
  handoff: ManagerHandoff | null;
  onClose: () => void;
}

export const ManagerHandoffModal: React.FC<ManagerHandoffModalProps> = ({ handoff, onClose }) => {
  const { confirmManagerHandoff } = useApp();

  if (!handoff) return null;

  const handleConfirm = () => {
    confirmManagerHandoff(handoff.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>WORKFORCE FAILOVER ENGINE</span>
              <span>·</span>
              <span>STRUCTURED BRIEFING PROTOCOL</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Manager Handoff: {handoff.previousManagerName} → {handoff.backupManagerName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Identity Preservation Notice */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-6 py-3 text-xs text-amber-900 flex items-start gap-2">
          <span className="font-bold text-amber-800">Identity Preservation:</span>
          <span>
            This briefing provides complete project state and operational context. It does
            <strong className="underline decoration-amber-400 font-semibold ml-1">NOT</strong> overwrite {handoff.backupManagerName}&apos;s
            own identity, provider architecture, or native cognitive reasoning. {handoff.backupManagerName} assumes leadership while remaining {handoff.backupManagerName}.
          </span>
        </div>

        {/* Briefing Dossier Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {/* Reason */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">Trigger Reason</span>
            <p className="text-slate-600">{handoff.reason}</p>
          </div>

          {/* Objective & State Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Project Objective</span>
              <p className="text-slate-600 leading-relaxed">{handoff.briefing.objective}</p>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Current State Summary</span>
              <p className="text-slate-600 leading-relaxed">{handoff.briefing.projectStateSummary}</p>
            </div>
          </div>

          {/* Task Work Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">
              Operational Task Inventory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-emerald-800 block mb-1 text-[11px] uppercase">
                  Completed Work ({handoff.briefing.completedWork.length})
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                  {handoff.briefing.completedWork.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-blue-800 block mb-1 text-[11px] uppercase">
                  Active & Unfinished Tasks
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                  {handoff.briefing.currentTasks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Decisions & Context */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-900 block">Recent Manager Decisions</span>
            <ul className="space-y-1 text-slate-600">
              {handoff.briefing.recentDecisions.map((dec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-slate-400">·</span>
                  <span>{dec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating Context & Next Expected Decision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Previous Operating Context</span>
              <p className="text-slate-600">{handoff.briefing.previousManagerOperatingContext}</p>
              <p className="text-slate-500 mt-2 text-[11px] italic">{handoff.briefing.previousManagerStyleNote}</p>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-semibold text-blue-900 block mb-1">Next Expected Action</span>
              <p className="text-slate-700 font-medium">{handoff.briefing.nextExpectedDecision}</p>
              <div className="mt-3 text-[11px] text-slate-500">
                Active Workers: {handoff.briefing.activeWorkers.join(', ') || 'Assigned squad'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Authorize Handoff to {handoff.backupManagerName}
          </button>
        </div>
      </div>
    </div>
  );
};
