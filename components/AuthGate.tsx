import React, { useState } from 'react';
import { Sprout, ShieldCheck, ArrowLeft } from 'lucide-react';
import { UIContent, Language } from '../types';
import LoginView from './LoginView';
import OfficerLoginView from './OfficerLoginView';

interface AuthGateProps {
  content: UIContent;
  lang: Language;
  onOfficerLoggedIn: () => void;
}

// Shown before anything else until the user is signed in. It reuses the existing
// farmer (mobile OTP) and officer (email + password) screens unchanged.
const AuthGate: React.FC<AuthGateProps> = ({ content, lang, onOfficerLoggedIn }) => {
  const isOdia = lang === Language.ODIA;
  const font = isOdia ? 'font-odia' : '';
  const [role, setRole] = useState<'farmer' | 'officer' | null>(null);

  if (role) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-md mx-auto px-4 pt-6">
          <button
            onClick={() => setRole(null)}
            className={`flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 ${font}`}
          >
            <ArrowLeft className="w-4 h-4" /> {content.back}
          </button>
          <p className={`text-xs text-slate-500 dark:text-slate-400 mt-3 ${font}`}>
            {role === 'farmer' ? content.gateFarmerHint : content.gateOfficerHint}
          </p>
        </div>
        {role === 'farmer'
          ? <LoginView content={content} lang={lang} onLoggedIn={() => {}} />
          : <OfficerLoginView content={content} lang={lang} onLoggedIn={onOfficerLoggedIn} />}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-12 pb-24 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className={`text-xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 ${font}`}>{content.gateTitle}</h2>
        <p className={`text-emerald-700 dark:text-emerald-400 ${font}`}>{content.gateSubtitle}</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => setRole('farmer')}
          className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 text-left hover:border-emerald-300 transition-colors"
        >
          <span className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6 text-emerald-600" />
          </span>
          <span className={`font-semibold text-slate-800 dark:text-slate-100 ${font}`}>{content.gateFarmer}</span>
        </button>
        <button
          onClick={() => setRole('officer')}
          className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 text-left hover:border-indigo-300 transition-colors"
        >
          <span className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </span>
          <span className={`font-semibold text-slate-800 dark:text-slate-100 ${font}`}>{content.gateOfficer}</span>
        </button>
      </div>
    </div>
  );
};

export default AuthGate;
