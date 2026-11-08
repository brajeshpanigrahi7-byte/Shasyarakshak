import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError } from './errors';
import { optionalUser, AuthUser } from './auth';
import { rateLimit } from './ratelimit';

interface Options {
  methods?: string[];
  limitPerMinute?: number; // per signed-in user
  anonLimitPerMinute?: number; // per IP when not signed in
  requireAuth?: boolean; // reject callers without a valid Firebase ID token
}

interface Ctx {
  req: VercelRequest;
  user: AuthUser | null;
  body: any;
}

function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function applyCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  // Same-origin browser calls send no CORS requirement; only echo explicitly allow-listed origins (e.g. a future Android WebView / dev host).
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
}

// Stable response envelope: { ok: true, data } | { ok: false, error: { code, message } }.
export function handler(fn: (ctx: Ctx) => Promise<unknown>, opts: Options = {}) {
  const methods = opts.methods ?? ['POST'];
  return async (req: VercelRequest, res: VercelResponse) => {
    applyCors(req, res);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      if (req.method === 'OPTIONS') return res.status(204).end();
      if (!methods.includes(req.method || '')) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');

      const user = await optionalUser(req.headers.authorization);
      if (opts.requireAuth && !user) throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      const route = req.url?.split('?')[0] || 'api';
      const key = user ? `u:${user.uid}:${route}` : `ip:${ip}:${route}`;
      const limit = user ? opts.limitPerMinute ?? 20 : opts.anonLimitPerMinute ?? 8;
      const rl = rateLimit(key, limit, 60_000);
      if (!rl.ok) {
        res.setHeader('Retry-After', String(rl.retryAfterSec));
        throw new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please wait a moment and try again.');
      }

      const data = await fn({ req, user, body: req.body ?? {} });
      return res.status(200).json({ ok: true, data });
    } catch (e: any) {
      if (e instanceof ApiError) {
        return res.status(e.status).json({ ok: false, error: { code: e.code, message: e.message } });
      }
      if (e?.message === 'AI_NOT_CONFIGURED') {
        return res.status(503).json({ ok: false, error: { code: 'AI_NOT_CONFIGURED', message: 'The AI service is not configured.' } });
      }
      // Never leak provider errors, keys or stack traces to the client.
      console.error('API error:', routeOf(req), e?.message);
      return res.status(502).json({
        ok: false,
        error: { code: 'AI_UNAVAILABLE', message: 'The AI service is temporarily unavailable. Please try again, or contact your local KVK / agriculture officer.' },
      });
    }
  };
}

function routeOf(req: VercelRequest): string {
  return req.url?.split('?')[0] || 'api';
}
