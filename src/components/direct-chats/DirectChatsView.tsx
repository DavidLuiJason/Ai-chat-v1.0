import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessageItem } from '../common/MessageItem.tsx';
import { Attachment } from '../../types/index.ts';
import { AttachmentViewerModal } from '../common/AttachmentViewerModal.tsx';
import { Send, MessageSquare, User, Cpu } from 'lucide-react';

export const DirectChatsView: React.FC = () => {
  const {
    accounts,
    directChatAccountId,
    setDirectChatAccountId,
    messages,
    settings,
    sendDirectChatMessage,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const selectedAccount =
    accounts.find((a) => a.id === directChatAccountId) || accounts[0];

  const directMessages = messages.filter(
    (m) => m.directChatAccountId === selectedAccount?.id
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending || !selectedAccount) return;

    const text = inputVal.trim();
    setInputVal('');
    setIsSending(true);

    try {
      await sendDirectChatMessage(selectedAccount.id, text);
    } catch (err) {
      console.error('Error sending direct chat:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-sm font-semibold text-slate-900">No Connected Accounts</h2>
          <p className="text-xs text-slate-500">
            Connect an AI account first to start 1-on-1 direct conversations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/40">
      {/* Left Account Selector */}
      <div className="w-full md:w-72 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-3 shrink-0">
        <div className="px-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Direct 1-on-1 Channels
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            Bypass Manager and speak directly to individual AI accounts.
          </p>
        </div>

        <div className="space-y-1">
          {accounts.map((acc) => {
            const isSelected = selectedAccount?.id === acc.id;
            const msgCount = messages.filter((m) => m.directChatAccountId === acc.id).length;

            return (
              <button
                key={acc.id}
                onClick={() => setDirectChatAccountId(acc.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-mono font-bold flex items-center gap-1.5">
                    <span>{acc.canonicalName}</span>
                  </div>
                  <span
                    className={`text-[10px] block truncate max-w-[170px] ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {acc.friendlyDescription || acc.capabilities.slice(0, 2).join(', ')}
                  </span>
                </div>

                {msgCount > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {msgCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      {selectedAccount ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30">
          {/* Direct Chat Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedAccount.canonicalName}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                  {selectedAccount.connectionStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Capabilities: {selectedAccount.capabilities.join(' · ')}
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-400">
              Identity #{selectedAccount.identityNumber} ({selectedAccount.providerId})
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {directMessages.length === 0 ? (
              <div className="py-16 text-center text-slate-400 max-w-sm mx-auto space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-semibold text-slate-700 text-sm">Direct Dialogue Channel</h4>
                <p className="text-xs text-slate-500">
                  Send a prompt directly to {selectedAccount.canonicalName}. This conversation bypasses
                  the workforce Manager and Filter.
                </p>
              </div>
            ) : (
              directMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  format={settings.messagePresentationFormat}
                  onPreviewAttachment={(att) => setPreviewAttachment(att)}
                />
              ))
            )}

            {isSending && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>{selectedAccount.canonicalName} is analyzing directly...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Message ${selectedAccount.canonicalName} directly...`}
              disabled={isSending}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-slate-500 bg-white"
            />
            <button
              type="submit"
              disabled={isSending || !inputVal.trim()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 p-8 text-center text-slate-400">Select an account for direct chat</div>
      )}

      {/* Attachment Preview Modal */}
      <AttachmentViewerModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};
