import { handler } from '../_lib/http';

// GET /api/v1/health — reports which server integrations are configured (never their values).
export default handler(async () => ({
  status: 'ok',
  time: new Date().toISOString(),
  integrations: {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    firebaseAuthVerification: Boolean(process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID),
  },
}), { methods: ['GET'], limitPerMinute: 60, anonLimitPerMinute: 30 });
