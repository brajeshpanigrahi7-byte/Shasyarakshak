import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, resetRateLimits } from '../api/_lib/ratelimit';
import { validateImage, detectImageMime, str, oneOf, isoDate } from '../api/_lib/validate';
import { ApiError } from '../api/_lib/errors';
import { optionalUser, requireUser } from '../api/_lib/auth';
import { handler } from '../api/_lib/http';

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]).toString('base64');
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]).toString('base64');
const exe = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00').toString('base64');

function mockRes() {
  const r: any = { headers: {} as Record<string, string>, code: 0, body: undefined };
  r.setHeader = (k: string, v: string) => (r.headers[k] = v);
  r.status = (c: number) => ((r.code = c), r);
  r.json = (b: unknown) => ((r.body = b), r);
  r.end = () => r;
  return r;
}
const mockReq = (o: any = {}) => ({ method: 'POST', headers: {}, url: '/api/v1/x', body: {}, socket: { remoteAddress: '1.1.1.1' }, ...o });

beforeEach(() => resetRateLimits());

describe('rate limiter', () => {
  it('blocks after the limit and recovers after the window', () => {
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 1000, 0).ok).toBe(true);
    expect(rateLimit('k', 3, 1000, 10).ok).toBe(false);
    expect(rateLimit('k', 3, 1000, 2000).ok).toBe(true);
  });
  it('keeps keys independent', () => {
    rateLimit('a', 1, 1000, 0);
    expect(rateLimit('b', 1, 1000, 0).ok).toBe(true);
  });
});

describe('image validation', () => {
  it('accepts real JPEG/PNG and strips data-URL prefix', () => {
    expect(validateImage(jpeg).mime).toBe('image/jpeg');
    expect(validateImage(`data:image/png;base64,${png}`).mime).toBe('image/png');
  });
  it('rejects non-images even if declared as images', () => {
    expect(detectImageMime(exe)).toBeNull();
    expect(() => validateImage(exe)).toThrow(ApiError);
  });
  it('rejects empty, non-base64 and oversized input', () => {
    expect(() => validateImage('')).toThrow();
    expect(() => validateImage('not base64!!')).toThrow();
    expect(() => validateImage('A'.repeat(4_000_001))).toThrow(/too large/);
  });
});

describe('field validators', () => {
  it('str / oneOf / isoDate', () => {
    expect(str('  hi ', 'x', 5)).toBe('hi');
    expect(() => str('toolong', 'x', 3)).toThrow();
    expect(() => str(5, 'x', 3)).toThrow();
    expect(() => oneOf('bad', 'c', ['a', 'b'] as const)).toThrow();
    expect(isoDate('2026-11-08', 'd')).toBe('2026-11-08');
    expect(() => isoDate('2026-13-45', 'd')).toThrow();
  });
});

describe('auth', () => {
  it('allows anonymous when no header, rejects malformed/forged tokens', async () => {
    expect(await optionalUser(undefined)).toBeNull();
    await expect(optionalUser('Basic abc')).rejects.toMatchObject({ status: 401 });
    process.env.FIREBASE_PROJECT_ID = 'demo';
    await expect(optionalUser('Bearer not.a.jwt')).rejects.toMatchObject({ status: 401, code: 'INVALID_TOKEN' });
    await expect(requireUser(undefined)).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  });
});

describe('handler envelope', () => {
  it('returns ok envelope', async () => {
    const res = mockRes();
    await handler(async () => ({ hello: 1 }))(mockReq() as any, res);
    expect(res.code).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { hello: 1 } });
  });
  it('rejects wrong method with 405', async () => {
    const res = mockRes();
    await handler(async () => 1)(mockReq({ method: 'GET' }) as any, res);
    expect(res.code).toBe(405);
  });
  it('maps ApiError and hides provider errors', async () => {
    const r1 = mockRes();
    await handler(async () => { throw new ApiError(400, 'INVALID_INPUT', 'bad'); })(mockReq() as any, r1);
    expect(r1.code).toBe(400);
    const r2 = mockRes();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await handler(async () => { throw new Error('secret key AIza123 leaked'); })(mockReq() as any, r2);
    expect(r2.code).toBe(502);
    expect(JSON.stringify(r2.body)).not.toContain('AIza123');
  });
  it('rate limits anonymous callers with 429 + Retry-After', async () => {
    const h = handler(async () => 1, { anonLimitPerMinute: 2 });
    for (let i = 0; i < 2; i++) await h(mockReq() as any, mockRes());
    const res = mockRes();
    await h(mockReq() as any, res);
    expect(res.code).toBe(429);
    expect(res.headers['Retry-After']).toBeDefined();
  });
  it('only sets CORS for allow-listed origins', async () => {
    process.env.ALLOWED_ORIGINS = 'https://ok.example';
    const a = mockRes(); await handler(async () => 1)(mockReq({ headers: { origin: 'https://ok.example' } }) as any, a);
    const b = mockRes(); await handler(async () => 1)(mockReq({ headers: { origin: 'https://evil.example' } }) as any, b);
    expect(a.headers['Access-Control-Allow-Origin']).toBe('https://ok.example');
    expect(b.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('route handlers (no Gemini key configured)', () => {
  const call = async (mod: string, body: any, method = 'POST') => {
    const { default: h } = await import(mod);
    const res = mockRes();
    await h(mockReq({ method, body }) as any, res);
    return res;
  };
  beforeEach(() => { delete process.env.GEMINI_API_KEY; resetRateLimits(); });

  it('diagnosis: rejects missing/invalid image before touching the AI', async () => {
    expect((await call('../api/v1/diagnosis', {})).code).toBe(400);
    expect((await call('../api/v1/diagnosis', { image: exe })).code).toBe(415);
  });
  it('diagnosis: valid image but AI unconfigured -> 503 AI_NOT_CONFIGURED', async () => {
    const r = await call('../api/v1/diagnosis', { image: jpeg, cropType: 'paddy' });
    expect(r.code).toBe(503);
    expect(r.body.error.code).toBe('AI_NOT_CONFIGURED');
  });
  it('diagnosis: rejects unknown cropType', async () => {
    expect((await call('../api/v1/diagnosis', { image: jpeg, cropType: 'weed' })).code).toBe(400);
  });
  it('calendar / advisory / assistant validate input', async () => {
    expect((await call('../api/v1/calendar', { crop: '', sowingDate: '2026-01-01' })).code).toBe(400);
    expect((await call('../api/v1/calendar', { crop: 'Paddy', sowingDate: 'tomorrow' })).code).toBe(400);
    expect((await call('../api/v1/advisory', { profile: { cropType: 'paddy' } })).code).toBe(400);
    expect((await call('../api/v1/assistant', { question: '' })).code).toBe(400);
    expect((await call('../api/v1/assistant', { question: 'hi', history: 'x' })).code).toBe(400);
  });
  it('health reports config without exposing values', async () => {
    process.env.GEMINI_API_KEY = 'secret-value';
    const r = await call('../api/v1/health', {}, 'GET');
    expect(r.body.data.integrations.gemini).toBe(true);
    expect(JSON.stringify(r.body)).not.toContain('secret-value');
  });
});
