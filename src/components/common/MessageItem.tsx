import React from 'react';
import { Message, MessagePresentationFormat, Attachment } from '../../types/index.ts';

interface MessageItemProps {
  message: Message;
  format: MessagePresentationFormat;
  onPreviewAttachment?: (attachment: Attachment) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  format,
  onPreviewAttachment,
}) => {
  const isUser = message.senderType === 'USER';
  const isSystem = message.senderType === 'SYSTEM';
  const senderLabel = message.accountIdentity || message.senderName;
  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    return (
      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
        {message.attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-md border border-slate-200 text-xs text-slate-800"
          >
            <span className="font-mono font-medium truncate max-w-[180px]">{att.name}</span>
            <span className="text-[11px] text-slate-500">({att.formattedSize})</span>
            {onPreviewAttachment && (
              <button
                type="button"
                onClick={() => onPreviewAttachment(att)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer ml-1"
              >
                Preview
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 1. Format: Standard ("ChatGPT 2: Hello.")
  if (format === 'standard') {
    return (
      <div
        className={`py-2 px-3 rounded-lg text-xs leading-relaxed transition-colors ${
          isUser
            ? 'bg-slate-100/80 border-l-2 border-slate-700'
            : isSystem
            ? 'bg-amber-50/70 border-l-2 border-amber-500 font-mono'
            : 'bg-white border border-slate-100'
        }`}
      >
        <div className="flex items-baseline justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-semibold ${isUser ? 'text-slate-900' : 'text-blue-900 font-mono'}`}>
              {senderLabel}:
            </span>
            {message.recipientName && (
              <span className="text-[10px] text-slate-400">→ {message.recipientName}</span>
            )}
            {message.taskId && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
                [{message.taskId}]
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{timeFormatted}</span>
        </div>
        <div className="text-slate-700 whitespace-pre-wrap">{message.content}</div>
        {renderAttachments()}
      </div>
    );
  }

  // 2. Format: Bracketed ("[ChatGPT 2] Hello.")
  if (format === 'bracketed') {
    return (
      <div
        className={`py-2 px-3 rounded-lg text-xs leading-relaxed ${
          isUser
            ? 'bg-slate-100/80'
            : isSystem
            ? 'bg-amber-50/70 text-amber-900'
            : 'bg-white border border-slate-100'
        }`}
      >
        <div className="flex items-baseline justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-slate-900">[{senderLabel}]</span>
            {message.recipientName && (
              <span className="text-[10px] text-slate-400">to [{message.recipientName}]</span>
            )}
            {message.taskId && (
              <span className="text-[10px] font-mono text-slate-500">#{message.taskId}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{timeFormatted}</span>
        </div>
        <div className="text-slate-700 whitespace-pre-wrap">{message.content}</div>
        {renderAttachments()}
      </div>
    );
  }

  // 3. Format: Compact ("ChatGPT 2 — Hello.")
  if (format === 'compact') {
    return (
      <div className="py-1.5 border-b border-slate-100 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-semibold text-slate-800 shrink-0">{senderLabel}</span>
          <span className="text-slate-400 text-[10px]">—</span>
          <div className="flex-1 text-slate-700 whitespace-pre-wrap">{message.content}</div>
          <span className="text-[10px] text-slate-400 shrink-0 font-mono">{timeFormatted}</span>
        </div>
        {renderAttachments()}
      </div>
    );
  }

  // 4. Format: Card (Full styled UI card)
  return (
    <div
      className={`p-4 rounded-xl border text-xs shadow-2xs transition-all ${
        isUser
          ? 'bg-slate-50 border-slate-200'
          : isSystem
          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold font-mono ${
              isUser ? 'text-slate-900' : 'text-blue-900 font-bold'
            }`}
          >
            {senderLabel}
          </span>
          <span className="text-[11px] text-slate-500">({message.senderType})</span>
          {message.recipientName && (
            <span className="text-[11px] text-slate-400">→ {message.recipientName}</span>
          )}
          {message.taskId && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              {message.taskId}
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-400">{timeFormatted}</span>
      </div>

      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{message.content}</div>
      {renderAttachments()}
    </div>
  );
};
