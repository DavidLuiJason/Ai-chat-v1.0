import React from 'react';
import { AvailabilityCheckRecord, AvailabilityStatus } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, X, Clock, Cpu } from 'lucide-react';

interface StagedAvailabilityModalProps {
  check: AvailabilityCheckRecord | null;
  onClose: () => void;
}

export const StagedAvailabilityModal: React.FC<StagedAvailabilityModalProps> = ({ check, onClose }) => {
  const { initiateManagerHandoff } = useApp();

  if (!check) return null;

  const handleActivateBackup = () => {
    if (check.role === 'MANAGER' && check.workspaceId) {
      initiateManagerHandoff(
        check.workspaceId,
        `Triggered by Availability Inspection: ${check.targetAccountName} was unresponsive or encountered errors.`
      );
      onClose();
    }
  };

  const getStatusBadge = (status: AvailabilityStatus) => {
    switch (status) {
      case 'RESPONDING':
        return (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>OPERATIONAL (RESPONDING)</span>
          </span>
        );
      case 'AUTHENTICATION_REQUIRED':
        return (
          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>AUTHENTICATION REQUIRED</span>
          </span>
        );
      case 'UNRESPONSIVE':
      case 'TEMPORARILY_UNAVAILABLE':
      case 'UNAVAILABLE':
        return (
          <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>UNAVAILABLE</span>
          </span>
        );
      default:
        return (
          <span className="text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Role: {check.role} · Live Verification
            </div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>Availability Audit: {check.targetAccountName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Details */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Status Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Diagnostic Status</span>
              {getStatusBadge(check.status)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Round-trip Latency</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{check.latencyMs} ms</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Checked At</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {new Date(check.checkedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Diagnostic Details */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Live Provider Diagnostic Feedback
            </label>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px]">
              {check.details || 'Live provider connection verified.'}
            </div>
          </div>

          {/* Failover Option for Manager */}
          {check.role === 'MANAGER' && !check.isOperational && check.workspaceId && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Manager Failover Available</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The active Manager is currently not responding. You can immediately activate the designated
                Backup Manager with a zero-loss state briefing.
              </p>
              <button
                onClick={handleActivateBackup}
                className="w-full mt-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-xs shadow-xs"
              >
                Initiate Failover to Backup Manager
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
