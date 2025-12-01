import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  return (
    <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
      <button
        onClick={() => onToggle(Language.ENGLISH)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          currentLang === Language.ENGLISH
            ? 'bg-white text-emerald-800 shadow-sm'
            : 'text-white hover:bg-white/10'
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => onToggle(Language.ODIA)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors font-odia ${
          currentLang === Language.ODIA
            ? 'bg-white text-emerald-800 shadow-sm'
            : 'text-white hover:bg-white/10'
        }`}
      >
        ଓଡ଼ିଆ
      </button>
    </div>
  );
};

export default LanguageToggle;