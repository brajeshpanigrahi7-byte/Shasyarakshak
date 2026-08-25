import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { UIContent, Language } from '../types';
import { signInOfficer, fetchOfficerRecord, isFirebaseConfigured } from '../services/officerService';
import { logout } from '../services/authService';

interface OfficerLoginViewProps {
  content: UIContent;
  lang: Language;
  onLoggedIn: () => void;
}

const OfficerLoginView: React.FC<OfficerLoginViewProps> = ({ content, lang, onLoggedIn }) => {
  const isOdia = lang === Language.ODIA;
  const configured = isFirebaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const user = await signInOfficer(email, password);
      const record = await fetchOfficerRecord(user.uid);
      if (!record) {
        // Authenticated, but not on the officer allowlist — sign back out and explain
        // so a stray account can't linger in a signed-in-but-role-less state.
        await logout();
        setError(content.officerLoginNotOfficer);
        return;
      }
      onLoggedIn();
    } catch {
      setError(content.officerLoginError);
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className={`text-sm text-amber-800 dark:text-amber-300 ${isOdia ? 'font-odia' : ''}`}>{content.loginNotConfigured}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-24">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>{content.officerLoginTitle}</h2>
        <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${isOdia ? 'font-odia' : ''}`}>{content.officerLoginSubtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
        <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
          {content.officerLoginEmailLabel}
        </label>
        <div className="flex items-center border border-slate-200 dark:border-slate-600 dark:bg-slate-900 rounded-lg overflow-hidden mb-4">
          <span className="px-3 text-slate-400 h-full flex items-center border-r border-slate-200 dark:border-slate-600">
            <Mail className="w-4 h-4" />
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.officerLoginEmailPlaceholder}
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none dark:text-white"
          />
        </div>

        <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
          {content.officerLoginPasswordLabel}
        </label>
        <div className="flex items-center border border-slate-200 dark:border-slate-600 dark:bg-slate-900 rounded-lg overflow-hidden mb-4">
          <span className="px-3 text-slate-400 h-full flex items-center border-r border-slate-200 dark:border-slate-600">
            <Lock className="w-4 h-4" />
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder={content.officerLoginPasswordPlaceholder}
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none dark:text-white"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email.trim() || !password}
          className={`w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 ${isOdia ? 'font-odia' : ''}`}
        >
          {loading ? content.officerLoggingIn : content.officerLoginButton}
        </button>

        {error && <p className={`text-red-600 text-sm mt-3 text-center ${isOdia ? 'font-odia' : ''}`}>{error}</p>}

        <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center leading-relaxed ${isOdia ? 'font-odia' : ''}`}>
          {content.officerLoginHint}
        </p>
      </div>
    </div>
  );
};

export default OfficerLoginView;
