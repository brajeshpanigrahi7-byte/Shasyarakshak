import React, { useState } from 'react';
import { Moon, Sun, Info, Trash2, Leaf, Share2 } from 'lucide-react';
import { UIContent, Language, Theme } from '../types';
import { getShareOptIn, setShareOptIn } from '../services/outbreakService';

interface SettingsViewProps {
  content: UIContent;
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
  onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ content, lang, theme, onToggleTheme, onClearData }) => {
  const isOdia = lang === Language.ODIA;
  const [shareData, setShareData] = useState(() => getShareOptIn());

  const toggleShareData = () => {
    const next = !shareData;
    setShareData(next);
    setShareOptIn(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">
      <h2 className={`text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 ${isOdia ? 'font-odia' : ''}`}>
        {content.settingsTitle}
      </h2>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <span className={`font-medium text-slate-700 dark:text-slate-200 ${isOdia ? 'font-odia' : ''}`}>
              {theme === 'dark' ? content.darkMode : content.lightMode}
            </span>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative transition-colors ${
              theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>

        <button
          onClick={toggleShareData}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-left">
            <Share2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium text-slate-700 dark:text-slate-200 ${isOdia ? 'font-odia' : ''}`}>
                {content.shareDataToggle}
              </p>
              <p className={`text-xs text-slate-400 dark:text-slate-500 ${isOdia ? 'font-odia' : ''}`}>
                {content.shareDataToggleDesc}
              </p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${
              shareData ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                shareData ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>

        <button
          onClick={() => {
            if (window.confirm(content.historyConfirmClear)) onClearData();
          }}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
          <span className={`font-medium text-red-600 ${isOdia ? 'font-odia' : ''}`}>{content.clearData}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-slate-400" />
          <h3 className={`font-bold text-slate-700 dark:text-slate-200 text-sm ${isOdia ? 'font-odia' : ''}`}>
            {content.smsFallbackTitle}
          </h3>
        </div>
        <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 ${isOdia ? 'font-odia' : ''}`}>
          {content.smsFallbackDesc}
        </p>
        <p className={`text-xs text-amber-600 dark:text-amber-400 ${isOdia ? 'font-odia' : ''}`}>
          {content.smsFallbackNotConfigured}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-5">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h3 className={`font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>
            {content.aboutApp}
          </h3>
        </div>
        <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${isOdia ? 'font-odia' : ''}`}>
          {isOdia
            ? 'ଶସ୍ୟରକ୍ଷକ ଓଡିଶାର ଧାନ ଓ ମାଣ୍ଡିଆ ଚାଷୀମାନଙ୍କ ପାଇଁ AI ସହାୟତାରେ ତିଆରି ଏକ ମାଗଣା ଆପ୍, ଯାହା ରୋଗ ଚିହ୍ନଟ, ପାଣିପାଗ ପରାମର୍ଶ ଏବଂ ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର ସହାୟତା ପ୍ରଦାନ କରେ।'
            : 'Shasyarakshak is a free, AI-assisted crop protection companion built for Paddy and Millet farmers in Odisha — combining instant disease diagnosis, local weather-based spray advisories, and direct access to nearby Krishi Vigyan Kendra experts.'}
        </p>
        <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
          <span>{content.appVersion}: 3.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
