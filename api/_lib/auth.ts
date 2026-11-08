import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ApiError } from './errors';

export interface AuthUser {
  uid: string;
  phone?: string;
  email?: string;
  role?: string; // from custom claims, set only by server-side admin tooling
}

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

function projectId(): string {
  const id = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (!id) throw new ApiError(503, 'AUTH_NOT_CONFIGURED', 'Authentication is not configured on the server.');
  return id;
}

// Verifies a Firebase ID token (signature, issuer, audience, expiry) without needing a service account.
export async function verifyIdToken(token: string): Promise<AuthUser> {
  const id = projectId();
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${id}`, audience: id });
    if (!payload.sub) throw new Error('no sub');
    return {
      uid: payload.sub,
      phone: payload.phone_number as string | undefined,
      email: payload.email as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    throw new ApiError(401, 'INVALID_TOKEN', 'Your session is invalid or expired. Please sign in again.');
  }
}

// Farmer flows are login-optional today, so a missing token is allowed (anonymous, stricter limits).
// A token that IS supplied must be valid — it is never silently ignored.
export async function optionalUser(authHeader: string | undefined): Promise<AuthUser | null> {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) throw new ApiError(401, 'INVALID_TOKEN', 'Malformed Authorization header.');
  return verifyIdToken(m[1]);
}

export async function requireUser(authHeader: string | undefined): Promise<AuthUser> {
  const u = await optionalUser(authHeader);
  if (!u) throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  return u;
}
