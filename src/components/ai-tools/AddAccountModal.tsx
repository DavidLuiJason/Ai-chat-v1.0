import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AuthType } from '../../types/index.ts';
import {
  peekNextSequentialNumber,
  generateCanonicalName,
} from '../../services/providerService.ts';
import { ShieldAlert, CheckCircle2, Loader2, X, Key, Server, Cpu } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProviderId?: string;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  defaultProviderId,
}) => {
  const { providers, connectAccount } = useApp();

  const [selectedProviderId, setSelectedProviderId] = useState(
    defaultProviderId || (providers[0]?.id ?? 'google-ai-studio')
  );
  const [selectedAuthType, setSelectedAuthType] = useState<AuthType>('server_environment');
  const [apiKey, setApiKey] = useState('');
  const [friendlyDesc, setFriendlyDesc] = useState('');
  const [customCapabilities, setCustomCapabilities] = useState('Code Synthesis, Architecture, Verification');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!isOpen) return null;

  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];
  const peekNumber = peekNextSequentialNumber(currentProvider?.id || 'provider');
  const previewCanonicalName = generateCanonicalName(currentProvider?.name || 'AI', peekNumber);

  const handleProviderChange = (provId: string) => {
    setSelectedProviderId(provId);
    setVerificationError(null);
    setVerificationSuccess(false);
    const prov = providers.find((p) => p.id === provId);
    if (prov) {
      if (prov.supportedAuth.includes('server_environment')) {
        setSelectedAuthType('server_environment');
      } else {
        setSelectedAuthType(prov.supportedAuth[0] || 'api_key');
      }
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);
    setIsVerifying(true);

    const caps = customCapabilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const result = await connectAccount({
        providerId: currentProvider.id,
        authType: selectedAuthType,
        apiKey: apiKey.trim() || undefined,
        friendlyDescription: friendlyDesc.trim() || undefined,
        capabilities: caps.length > 0 ? caps : undefined,
      });

      if (!result.success) {
        setVerificationError(result.error || 'Connection failed: invalid credentials or unreachable endpoint.');
        setIsVerifying(false);
        return;
      }

      setVerificationSuccess(true);
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setVerificationError(err?.message || 'Unexpected connection error occurred.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Account Onboarding
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Connect Real AI Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConnect} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Available AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map((p) => {
                const isSelected = p.id === selectedProviderId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {p.vendor}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canonical Identity Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">
                Permanent Canonical Identity
              </span>
              <span className="text-slate-400 text-[10px]">Sequential (Never reused)</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-600" />
              <span>{previewCanonicalName}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              All tasks and filter reports will preserve this identity stably throughout the workspace history.
            </p>
          </div>

          {/* Authentication Mechanism */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Authentication Method
            </label>
            <div className="space-y-1.5">
              {currentProvider.supportedAuth.includes('server_environment') && (
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedAuthType === 'server_environment'
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="authType"
                    value="server_environment"
                    checked={selectedAuthType === 'server_environment'}
                    onChange={() => setSelectedAuthType('server_environment')}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-slate-600" />
                      <span>Server Environment Key (GEMINI_API_KEY)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Uses the pre-configured runtime secret injected into the environment. Tested in real-time.
                    </div>
                  </div>
                </label>
              )}

              {currentProvider.supportedAuth.includes('api_key') && (
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedAuthType === 'api_key'
                      ? 'border-slate-900 bg-slate-50 text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="authType"
                    value="api_key"
                    checked={selectedAuthType === 'api_key'}
                    onChange={() => setSelectedAuthType('api_key')}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-600" />
                      <span>Direct API Key / Bearer Token</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Requires authentic provider key verified against the provider endpoint before connecting.
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* API Key Input (if api_key selected) */}
          {selectedAuthType === 'api_key' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentProvider.name} API Key
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setVerificationError(null);
                }}
                placeholder={
                  currentProvider.id === 'chatgpt'
                    ? 'sk-proj-...'
                    : currentProvider.id === 'claude'
                    ? 'sk-ant-...'
                    : currentProvider.id === 'grok'
                    ? 'xai-...'
                    : 'Enter API key...'
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                Keys are verified live against the provider adapter. Unverified keys are rejected.
              </div>
            </div>
          )}

          {/* Optional Friendly Role */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Role / Working Specialization (Optional)
            </label>
            <input
              type="text"
              value={friendlyDesc}
              onChange={(e) => setFriendlyDesc(e.target.value)}
              placeholder="e.g. Distributed Systems & Security Reviewer"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Capabilities */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Capabilities (Comma-separated)
            </label>
            <input
              type="text"
              value={customCapabilities}
              onChange={(e) => setCustomCapabilities(e.target.value)}
              placeholder="e.g. Architecture, Code Synthesis, Verification"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Honest Error Display */}
          {verificationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <div className="font-semibold text-xs">Connection Verification Failed</div>
                <div className="text-[11px] mt-0.5 leading-relaxed">{verificationError}</div>
                <div className="text-[10px] text-red-500 mt-1">
                  Account will NOT be marked connected without authentic verification.
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {verificationSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="font-semibold text-xs">Verified and Connected Successfully</div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Verify & Connect</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
