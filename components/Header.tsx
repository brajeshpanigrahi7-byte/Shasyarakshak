import React from 'react';
import { Leaf } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { Language, UIContent } from '../types';

interface HeaderProps {
  lang: Language;
  content: UIContent;
  onLangChange: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, content, onLangChange }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-green-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h1 className={`text-lg font-bold leading-tight ${lang === Language.ODIA ? 'font-odia text-xl' : ''}`}>
              {content.title}
            </h1>
            <p className={`text-xs text-emerald-100 opacity-90 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
              {content.subtitle}
            </p>
          </div>
        </div>
        <LanguageToggle currentLang={lang} onToggle={onLangChange} />
      </div>
    </header>
  );
};

export default Header;