import React from 'react';
import { Home, History, CloudSun, Settings } from 'lucide-react';
import { UIContent, Language } from '../types';

export type Tab = 'home' | 'history' | 'weather' | 'settings';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  content: UIContent;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange, content, lang }) => {
  const isOdia = lang === Language.ODIA;

  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: content.navHome, icon: <Home className="w-5 h-5" /> },
    { id: 'history', label: content.navHistory, icon: <History className="w-5 h-5" /> },
    { id: 'weather', label: content.navWeather, icon: <CloudSun className="w-5 h-5" /> },
    { id: 'settings', label: content.navSettings, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600'
              }`}
            >
              {item.icon}
              <span className={`text-[11px] font-medium ${isOdia ? 'font-odia' : ''}`}>{item.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
