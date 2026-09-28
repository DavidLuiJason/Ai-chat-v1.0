import React from 'react';

interface AttachmentViewerProps {
  attachment: {
    id: string;
    name: string;
    mimeType: string;
    formattedSize: string;
    fileType: string;
    contentPreview?: string;
    creatorName?: string;
    createdAt?: string;
  } | null;
  onClose: () => void;
  onDownload?: () => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerProps> = ({
  attachment,
  onClose,
  onDownload,
}) => {
  if (!attachment) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const blob = new Blob([attachment.contentPreview || ''], { type: attachment.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isCsv = attachment.fileType === 'csv' || attachment.name.endsWith('.csv');
  const isCode = attachment.fileType === 'code' || attachment.name.endsWith('.ts') || attachment.name.endsWith('.js') || attachment.name.endsWith('.json');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{attachment.fileType.toUpperCase()}</span>
              <span>·</span>
              <span>{attachment.formattedSize}</span>
              {attachment.creatorName && (
                <>
                  <span>·</span>
                  <span>Produced by {attachment.creatorName}</span>
                </>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 font-mono">{attachment.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Download File
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-900 text-slate-100">
          {attachment.contentPreview ? (
            isCsv ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-700 text-xs">
                  <tbody>
                    {attachment.contentPreview.split('\n').filter(Boolean).map((row, rIdx) => {
                      const cells = row.split(',');
                      return (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800 font-semibold text-emerald-400 border-b border-slate-700' : 'border-b border-slate-800'}>
                          {cells.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 border-r border-slate-800 last:border-r-0 whitespace-nowrap">
                              {cell.trim()}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words leading-relaxed text-slate-300">
                {attachment.contentPreview}
              </pre>
            )
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">Binary / Archive Artifact</p>
              <p className="text-xs text-slate-500 mt-1">Direct preview not available for this binary format. Click Download to inspect.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>MIME: {attachment.mimeType}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
