import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIAccount, Provider } from '../../types/index.ts';
import {
  Cpu,
  Plus,
  Trash2,
  Activity,
  MessageSquare,
  Key,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface AiToolsViewProps {
  onOpenAddAccount: () => void;
}

export const AiToolsView: React.FC<AiToolsViewProps> = ({ onOpenAddAccount }) => {
  const {
    providers,
    accounts,
    removeAccount,
    runAvailabilityCheck,
    setDirectChatAccountId,
    setActiveNav,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'providers'>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.id || null
  );
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    accountId: string;
    isOperational: boolean;
    latencyMs: number;
    details: string;
  } | null>(null);

  const connectedAccounts = accounts.filter((a) => a.connectionStatus === 'CONNECTED');
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleTestAvailability = async (account: AIAccount) => {
    setTestingAccountId(account.id);
    setTestResult(null);
    try {
      // workspaceId can be empty or general
      const result = await runAvailabilityCheck(account.id, '');
      setTestResult({
        accountId: account.id,
        isOperational: result.isOperational,
        latencyMs: result.latencyMs,
        details: result.details,
      });
    } catch (err: any) {
      setTestResult({
        accountId: account.id,
        isOperational: false,
        latencyMs: 0,
        details: err?.message || 'Availability test failed',
      });
    } finally {
      setTestingAccountId(null);
    }
  };

  const handleStartDirectChat = (accId: string) => {
    setDirectChatAccountId(accId);
    setActiveNav('direct-chats');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/40">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Fleet Architecture
          </div>
          <h1 className="text-base font-bold text-slate-900">AI Accounts & Providers</h1>
        </div>

        <button
          onClick={onOpenAddAccount}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex gap-4 text-xs shrink-0">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Connected Accounts</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
            {accounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`py-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'providers'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Available Providers</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
            {providers.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === 'accounts' ? (
          /* Accounts Tab */
          accounts.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12 px-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No Connected AI Accounts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect an AI account using real provider credentials. Account identities are strictly sequential and never reused.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAddAccount}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Connect Your First Account
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((acc) => {
                  const prov = providers.find((p) => p.id === acc.providerId);
                  const isTesting = testingAccountId === acc.id;
                  const isSelected = selectedAccountId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-4 bg-white rounded-xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-slate-500" />
                            <span>{acc.canonicalName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {prov?.name || acc.providerId} · Account #{acc.identityNumber}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                            acc.connectionStatus === 'CONNECTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {acc.connectionStatus}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 line-clamp-2">
                        {acc.friendlyDescription || 'General workforce agent'}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {acc.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestAvailability(acc);
                          }}
                          disabled={isTesting}
                          className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer disabled:text-slate-300"
                        >
                          <Activity className={`w-3 h-3 ${isTesting ? 'animate-pulse text-amber-500' : ''}`} />
                          <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDirectChat(acc.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                            title="Direct Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Disconnect and remove ${acc.canonicalName}? Complete history will still be preserved.`)) {
                                removeAccount(acc.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                            title="Disconnect Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline test result */}
                      {testResult && testResult.accountId === acc.id && (
                        <div
                          className={`p-2 rounded text-[11px] border ${
                            testResult.isOperational
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <div className="font-semibold">
                            {testResult.isOperational ? 'Ping Succeeded' : 'Ping Failed'} ({testResult.latencyMs}ms)
                          </div>
                          <div className="text-[10px] mt-0.5">{testResult.details}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          /* Providers Tab */
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">
                Extensible Provider Architecture
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The application catalog includes standard AI providers with distinct adapters.
                Accounts connected to these providers interact via authentic APIs or credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providers.map((prov) => {
                const accountsUnderProvider = accounts.filter((a) => a.providerId === prov.id);

                return (
                  <div
                    key={prov.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{prov.name}</div>
                        <div className="text-[10px] text-slate-400">{prov.vendor}</div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {accountsUnderProvider.length} connected
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-normal">
                      {prov.description}
                    </p>

                    <div className="space-y-1 text-[11px]">
                      <div className="text-slate-500 font-medium">Interaction Modes:</div>
                      <div className="flex flex-wrap gap-1">
                        {prov.supportedModes.map((mode) => (
                          <span
                            key={mode}
                            className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[10px]"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {prov.supportedAuth.join(' · ')}
                      </span>
                      <button
                        onClick={onOpenAddAccount}
                        className="text-xs font-medium text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Connect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
