import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../types';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  backLabel: string;
  lang: Language;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack, backLabel, lang }) => {
  const isOdia = lang === Language.ODIA;
  return (
    <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 -ml-1 px-2 py-1 rounded-lg"
        aria-label={backLabel}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>{title}</h1>
    </div>
  );
};

export default ScreenHeader;
