import React from 'react';
import { Trash2, Inbox, AlertOctagon, CheckCircle } from 'lucide-react';
import { HistoryEntry, UIContent, Language } from '../types';

interface HistoryViewProps {
  entries: HistoryEntry[];
  content: UIContent;
  lang: Language;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const severityDot: Record<string, string> = {
  Low: 'bg-yellow-400',
  Medium: 'bg-orange-400',
  High: 'bg-red-500',
};

const HistoryView: React.FC<HistoryViewProps> = ({ entries, content, lang, onSelect, onDelete, onClearAll }) => {
  const isOdia = lang === Language.ODIA;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className={`text-lg font-bold text-slate-700 dark:text-slate-200 mb-1 ${isOdia ? 'font-odia' : ''}`}>
          {content.historyEmpty}
        </h3>
        <p className={`text-sm text-slate-500 dark:text-slate-400 max-w-xs ${isOdia ? 'font-odia' : ''}`}>
          {content.historyEmptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>
          {content.historyTitle}
        </h2>
        <button
          onClick={() => {
            if (window.confirm(content.historyConfirmClear)) onClearAll();
          }}
          className={`text-sm font-medium text-red-600 hover:text-red-700 ${isOdia ? 'font-odia' : ''}`}
        >
          {content.historyClearAll}
        </button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const name = isOdia ? entry.result.diagnosisNameOdia : entry.result.diagnosisName;
          const date = new Date(entry.timestamp).toLocaleString(isOdia ? 'or-IN' : 'en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(entry)}
            >
              <img
                src={`data:image/jpeg;base64,${entry.thumbnail}`}
                alt={name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {entry.result.isHealthy ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <p className={`font-semibold text-slate-800 dark:text-slate-100 truncate ${isOdia ? 'font-odia' : ''}`}>
                    {name}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {!entry.result.isHealthy && (
                    <span className={`w-2 h-2 rounded-full ${severityDot[entry.result.severity]}`} />
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-400">{date}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                title={content.historyDelete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
