import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessagePresentationFormat } from '../../types/index.ts';
import { Settings as SettingsIcon, Trash2, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useApp();
  const [resetDone, setResetDone] = useState(false);

  const presentationOptions: {
    id: MessagePresentationFormat;
    label: string;
    description: string;
    preview: string;
  }[] = [
    {
      id: 'standard',
      label: 'Standard Format',
      description: 'Clean typographic layout with colon delimiter',
      preview: 'ChatGPT 2: I completed the database latency audit.',
    },
    {
      id: 'bracketed',
      label: 'Bracketed Identity',
      description: 'Distinctive bracketed sender identifier',
      preview: '[ChatGPT 2] I completed the database latency audit.',
    },
    {
      id: 'compact',
      label: 'Compact Minimalist',
      description: 'Ultra-dense single-line layout with em-dash separator',
      preview: 'ChatGPT 2 — I completed the database latency audit.',
    },
    {
      id: 'card',
      label: 'Structured Card Format',
      description: 'Full dimensional card container with metadata and task chips',
      preview: 'Card layout with dedicated sender header and task correlation chip.',
    },
  ];

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all application data? This restores the application to an empty fresh installation state.')) {
      resetAllData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto text-xs">
      {/* Header */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Preferences
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-600 mt-1">
          Configure message display format and application persistence.
        </p>
      </div>

      {/* Message Presentation Format */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Message Presentation Format</h2>
          <p className="text-slate-500 mt-0.5">
            Select how AI-generated messages are formatted in User Conversation and Workforce Activity.
            Underlying message data retains raw structured attributes regardless of format.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presentationOptions.map((opt) => {
            const isSelected = settings.messagePresentationFormat === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ messagePresentationFormat: opt.id })}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{opt.label}</span>
                  {isSelected && (
                    <span className="text-[10px] text-slate-900 bg-slate-200 font-bold px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{opt.description}</p>
                <div className="p-2 rounded bg-slate-100 font-mono text-[11px] text-slate-700 truncate">
                  {opt.preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution Settings */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Live AI Execution</h2>
        <p className="text-slate-500">
          When enabled, task requests dispatched to connected AI accounts make authentic backend requests.
        </p>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={settings.enableRealCalls}
            onChange={(e) => updateSettings({ enableRealCalls: e.target.checked })}
            className="rounded text-slate-900 focus:ring-slate-900"
          />
          <div>
            <div className="font-semibold text-slate-900">Enable Live Provider API Requests</div>
            <div className="text-[11px] text-slate-500">
              Calls live models using verified credentials.
            </div>
          </div>
        </label>
      </div>

      {/* Reset Application Data */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-red-100 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-red-900">Reset Application State</h2>
        <p className="text-slate-500">
          Removes all connected accounts, workspaces, tasks, messages, and saved state from local storage.
          Restores a clean empty installation state.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All Application Data</span>
          </button>

          {resetDone && (
            <span className="text-xs text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Data cleared successfully</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
