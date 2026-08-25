import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDb, isFirebaseConfigured } from './firebaseClient';
import { OfficerRecord } from '../types';

export { isFirebaseConfigured };

const OFFICERS_COLLECTION = 'officers';

// Email/password sign-in for admin-provisioned KVK officers. Shares the same
// Firebase Auth instance as the farmer phone-OTP flow (see authService.ts) — the
// role is decided afterwards by whether an officers/{uid} record exists, so the
// two login methods never collide. No reCAPTCHA needed (that's phone-only), so
// this works on localhost out of the box.
export async function signInOfficer(email: string, password: string): Promise<User> {
  const auth = getAuthInstance();
  if (!auth) throw new Error('FIREBASE_NOT_CONFIGURED');
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

// Looks up the allowlist doc at officers/{uid}. A signed-in user is treated as an
// officer ONLY if this record exists (admin-provisioned; client writes are denied
// by the Firestore rules). Returns null for ordinary farmers.
export async function fetchOfficerRecord(uid: string): Promise<OfficerRecord | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, OFFICERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email ?? '',
    name: data.name ?? '',
    district: data.district ?? '',
  };
}
