import React, { useState } from 'react';
import { Phone, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UIContent, Language } from '../types';
import { ConfirmationResult } from 'firebase/auth';
import { sendOtp, verifyOtp, isFirebaseConfigured } from '../services/authService';

interface LoginViewProps {
  content: UIContent;
  lang: Language;
  onLoggedIn: () => void;
}

const RECAPTCHA_CONTAINER_ID = 'shasya-recaptcha-container';

const LoginView: React.FC<LoginViewProps> = ({ content, lang, onLoggedIn }) => {
  const isOdia = lang === Language.ODIA;
  const configured = isFirebaseConfigured();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) return;
    setLoading(true);
    setError('');
    try {
      const result = await sendOtp(phone, RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
    } catch {
      setError(content.loginError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!confirmation || otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      await verifyOtp(confirmation, otp);
      setSuccess(true);
      setTimeout(onLoggedIn, 800);
    } catch {
      setError(content.loginError);
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
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>{content.loginTitle}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
            <p className={`font-semibold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>{content.loginSuccess}</p>
          </div>
        ) : !confirmation ? (
          <>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.loginPhoneLabel}
            </label>
            <div className="flex items-center border border-slate-200 dark:border-slate-600 dark:bg-slate-900 rounded-lg overflow-hidden mb-4">
              <span className="px-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 h-full flex items-center border-r border-slate-200 dark:border-slate-600">
                <Phone className="w-4 h-4 mr-1" /> +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={content.loginPhonePlaceholder}
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none dark:text-white"
                maxLength={10}
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || phone.replace(/\D/g, '').length < 10}
              className={`w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 ${isOdia ? 'font-odia' : ''}`}
            >
              {loading ? content.loginSendingOtp : content.loginSendOtp}
            </button>
          </>
        ) : (
          <>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.loginOtpLabel}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={content.loginOtpPlaceholder}
              maxLength={6}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm text-center tracking-[0.4em] mb-4"
            />
            <button
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              className={`w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 ${isOdia ? 'font-odia' : ''}`}
            >
              {loading ? content.loginVerifyingOtp : content.loginVerifyOtp}
            </button>
            <button
              onClick={() => { setConfirmation(null); setOtp(''); setError(''); }}
              className={`w-full text-center text-xs text-slate-400 mt-3 ${isOdia ? 'font-odia' : ''}`}
            >
              {content.loginChangeNumber}
            </button>
          </>
        )}
        {error && <p className={`text-red-600 text-sm mt-3 text-center ${isOdia ? 'font-odia' : ''}`}>{error}</p>}
      </div>

      {/* Required, invisible: Firebase attaches its reCAPTCHA challenge here before sending SMS */}
      <div id={RECAPTCHA_CONTAINER_ID} />
    </div>
  );
};

export default LoginView;
