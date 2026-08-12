import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Vite exposes any env var prefixed with VITE_ on import.meta.env automatically —
// no vite.config.ts changes needed. Add these to .env.local (see README for setup).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function ensureApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

// Lazily initialize so the app doesn't crash for users who haven't set up
// Firebase yet — Community Q&A and the Officer Dashboard simply show a
// "not configured" state instead (see isFirebaseConfigured()).
export function getDb(): Firestore | null {
  const a = ensureApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

export function getAuthInstance(): Auth | null {
  const a = ensureApp();
  if (!a) return null;
  if (!auth) auth = getAuth(a);
  return auth;
}
