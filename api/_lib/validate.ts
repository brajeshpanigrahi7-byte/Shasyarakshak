import { ApiError } from './errors';

export const MAX_IMAGE_BASE64_CHARS = 4_000_000; // keeps the JSON body under Vercel's 4.5 MB limit

// Detects the real image type from magic bytes — the client-declared type is never trusted.
export function detectImageMime(base64: string): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64.slice(0, 64), 'base64');
  } catch {
    return null;
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}

export function validateImage(raw: unknown): { base64: string; mime: string } {
  if (typeof raw !== 'string' || !raw) throw new ApiError(400, 'INVALID_IMAGE', 'An image is required.');
  const base64 = raw.replace(/^data:[^;]+;base64,/, '');
  if (base64.length > MAX_IMAGE_BASE64_CHARS) throw new ApiError(413, 'IMAGE_TOO_LARGE', 'Image is too large. Please use a smaller photo.');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new ApiError(400, 'INVALID_IMAGE', 'Image data is not valid.');
  const mime = detectImageMime(base64);
  if (!mime) throw new ApiError(415, 'UNSUPPORTED_IMAGE', 'Only JPEG, PNG or WebP images are supported.');
  return { base64, mime };
}

export function str(v: unknown, name: string, max: number, opts: { required?: boolean } = { required: true }): string {
  if (v === undefined || v === null || v === '') {
    if (opts.required === false) return '';
    throw new ApiError(400, 'INVALID_INPUT', `${name} is required.`);
  }
  if (typeof v !== 'string') throw new ApiError(400, 'INVALID_INPUT', `${name} must be text.`);
  const t = v.trim();
  if (opts.required !== false && !t) throw new ApiError(400, 'INVALID_INPUT', `${name} is required.`);
  if (t.length > max) throw new ApiError(400, 'INVALID_INPUT', `${name} is too long (max ${max}).`);
  return t;
}

export function oneOf<T extends string>(v: unknown, name: string, allowed: readonly T[]): T {
  if (typeof v !== 'string' || !allowed.includes(v as T)) throw new ApiError(400, 'INVALID_INPUT', `${name} is invalid.`);
  return v as T;
}

export function isoDate(v: unknown, name: string): string {
  const s = str(v, name, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(new Date(s).getTime())) throw new ApiError(400, 'INVALID_INPUT', `${name} must be YYYY-MM-DD.`);
  return s;
}
