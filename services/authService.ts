import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { getAuthInstance, isFirebaseConfigured } from './firebaseClient';

export { isFirebaseConfigured };

let recaptchaVerifier: RecaptchaVerifier | null = null;

// Firebase requires an invisible reCAPTCHA bound to a real DOM element before it will
// send an SMS — this must exist in the page before calling sendOtp().
function getRecaptcha(containerId: string): RecaptchaVerifier | null {
  const auth = getAuthInstance();
  if (!auth) return null;
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  }
  return recaptchaVerifier;
}

// Normalizes a 10-digit Indian mobile number into E.164 format Firebase requires.
export function toE164Indian(rawNumber: string): string {
  const digits = rawNumber.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export async function sendOtp(phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> {
  const auth = getAuthInstance();
  if (!auth) throw new Error('FIREBASE_NOT_CONFIGURED');

  const verifier = getRecaptcha(recaptchaContainerId);
  if (!verifier) throw new Error('FIREBASE_NOT_CONFIGURED');

  return signInWithPhoneNumber(auth, toE164Indian(phoneNumber), verifier);
}

export async function verifyOtp(confirmation: ConfirmationResult, code: string): Promise<User> {
  const result = await confirmation.confirm(code);
  return result.user;
}

export function logout(): Promise<void> {
  const auth = getAuthInstance();
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  const auth = getAuthInstance();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// A privacy-friendly display label — last 4 digits only, e.g. "Farmer •••• 4821".
export function maskedPhoneLabel(phoneNumber: string | null): string {
  if (!phoneNumber) return 'Farmer';
  const last4 = phoneNumber.slice(-4);
  return `Farmer •••• ${last4}`;
}
