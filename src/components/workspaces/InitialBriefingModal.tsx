import React from 'react';
import { InitialBriefing } from '../../types/index.ts';

interface InitialBriefingModalProps {
  briefing: InitialBriefing | null;
  onClose: () => void;
}

export const InitialBriefingModal: React.FC<InitialBriefingModalProps> = ({ briefing, onClose }) => {
  if (!briefing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>WORKFORCE PRE-FLIGHT AUDIT</span>
              <span>·</span>
              <span>SOURCE & DATE ATTRIBUTION PRESERVED</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Initial Project Briefing Dossier
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

        {/* Epistemic note */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 text-xs text-blue-900 flex items-center justify-between">
          <span>
            Source dates and provenance records are attached to prevent unwarranted recency bias.
          </span>
          <span className="font-mono text-[11px] text-blue-700">
            {new Date(briefing.timestamp).toLocaleDateString()}
          </span>
        </div>

        {/* Surveyed contributions */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-4">
            {briefing.contributions.map((c) => (
              <div key={c.accountId} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{c.accountName}</span>
                    <span className="text-xs text-slate-500 font-mono">({c.provider})</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {c.readiness}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-slate-700 block mb-0.5">Relevant Knowledge</span>
                    <p className="text-slate-600 leading-relaxed">{c.relevantKnowledge}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 block mb-0.5">Working Style & Persona</span>
                    <p className="text-slate-600 leading-relaxed">{c.workingStyle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-medium text-slate-700 block mb-0.5">Reported Capabilities</span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                      {(c.capabilities || []).join(' · ')}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 block mb-0.5">Knowledge Provenance / Dates</span>
                    <span className="text-[11px] text-slate-500 font-mono">{c.sourcesAndDates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block mb-1">Manager Synthesis</span>
            <p className="leading-relaxed">{briefing.synthesizedNotes}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
