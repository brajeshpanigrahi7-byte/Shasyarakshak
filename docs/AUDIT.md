# Shasyarakshak — Phase 1 & 2 Audit (2026-11-08)

Scope: audit only. No application code, frontend files, name or branding were changed.

## 1. Stack
- Frontend: Vite 6 + React 19 + TypeScript (single-page app, root-level `App.tsx`, `components/`, `landing/`). PWA (`public/sw.js`, `manifest.json`).
- Backend: **none.** All logic runs in the browser and calls third parties directly.
- Database: Cloud Firestore (client SDK only) + `localStorage`.
- Auth: Firebase Auth — farmer phone OTP (`authService.ts`), officer email/password (`officerService.ts`).
- AI: `@google/genai` called **from the browser** (`geminiService.ts`).
- Hosting: Vercel (`vercel.json`: Vite build, `/app/*` rewrite to `index.html`). No `/api` functions.
- Firebase config present: `firebase.json` (Firestore rules only), `firestore.rules`. No Functions, Storage, App Check or indexes file.

## 2. Existing working functionality (by code inspection, not yet executed)
| Feature | Where | Notes |
|---|---|---|
| AI crop diagnosis (Paddy/Millet/Vegetable) | `geminiService.analyzeCropImage` | Structured JSON, English + Odia |
| AI Farm Doctor advisory | `generateFarmDoctorAdvisory` | Uses profile + weather |
| AI Crop Calendar | `generateCropCalendar` | Generated per request, not stored |
| Voice/Q&A assistant | `askFarmingQuestion`, speech services | |
| Weather (current + 6h rain chance) | `weatherService.ts` (Open-Meteo, no key) | Real data; no 7-day, no alerts, no cache |
| Profit calculator | `profitService.ts` | Client-only, not saved |
| Mandi prices | `mandiService.ts` (data.gov.in) | Needs `VITE_DATAGOVIN_API_KEY` |
| Community Q&A | `communityService.ts` | Login-optional |
| Officer login + district dashboard | `officerService.ts`, `OfficerDashboardView` | Officer = doc at `officers/{uid}` |
| KVK finder | `data/kvkOdisha.ts` | Static dataset |
| Scan history | `historyService.ts` | **localStorage only** (max 30) |

## 3. Broken / incomplete
- Field Monitor is a "Coming Soon" stub: GPS saved to localStorage, no satellite data.
- Farm profile, field location, history, advisory cache: device-local; only the farm profile syncs to Firestore, and only for phone-login users.
- No farms/crops/activity records, reminders, notifications, officer query inbox, schemes module, admin console, audit log, account deletion, or profit-report storage.
- Weather lacks 7-day forecast, severe alerts, caching, rate limiting, location fallback.
- Profit formula omits seeds/irrigation fields requested in the spec (current: fertilizer + labour + other).
- Service worker has no versioned update strategy for API responses.

## 4. Security findings
| # | Severity | Finding |
|---|---|---|
| S1 | **Critical** | `vite.config.ts` injects `GEMINI_API_KEY` into the client bundle via `define`; `geminiService.ts` calls Gemini from the browser. Anyone can extract the key from the deployed JS and spend your quota. **Rotate the key once it is moved server-side.** |
| S2 | High | `diagnosis_reports` and `community_posts` allow `create: if true` — no auth, no field validation, no size limits, no rate limit; spam/poisoning possible. |
| S3 | High | `community_replies` create rule only checks `authorRole`; `postId`, text length and author label are unvalidated. |
| S4 | High | No server-side validation of image type/size before it goes to the AI (client only declares `image/jpeg`). |
| S5 | Medium | `fetchDistrictAggregate` reads and aggregates every report client-side — doesn't scale; no pagination. |
| S6 | Medium | No App Check, so Firebase keys can be used by any origin. |
| S7 | Medium | Officer jurisdiction (`district`) is not enforced in rules; any officer can read all districts' reports. |
| S8 | Medium | No audit logging; no role model beyond "officer exists". Admin/Super Admin roles do not exist. |
| S9 | Low | `farmer_profiles` write rule has no schema validation. |
| S10 | Low | Firebase web config values (`VITE_FIREBASE_*`) are public by design — not a leak, but must be paired with rules + App Check. |

Positive: officer allowlist is not client-writable; officer badge on replies is rule-enforced; no passwords stored in Firestore; no secrets committed (no `.env*` in repo; `.gitignore` covers `*.local`).

## 5. Target architecture (Phase 3 proposal)
Keep Firebase (Auth + Firestore) as the system of record, and add a server layer **on Vercel serverless functions under `/api/v1/*`** using `firebase-admin`. This avoids requiring the Firebase Blaze plan for Cloud Functions, keeps the existing Vercel deployment, and gives Android the same HTTPS API.

- `api/v1/_lib/` — auth (verify Firebase ID token), RBAC, validation (zod), rate limit, errors, audit log, response envelope.
- Routes: `auth`, `farmers`, `farms`, `crops`, `diagnosis`, `weather`, `satellite`, `calendar`, `profit`, `schemes`, `officers`, `notifications`, `admin`.
- Roles via Firebase **custom claims** (`farmer | officer | admin | superadmin`), set only by admin API / script; never from registration.
- Scheduled reminders: Vercel Cron → `/api/v1/cron/reminders` (Hobby plan limits cron frequency — daily).
- Storage: Firebase Storage for diagnosis/query images (needs Storage enabled in the Firebase project).
- Frontend change footprint: `services/*.ts` only (swap direct calls for `fetch('/api/v1/...')` with the same function signatures), so components and visuals stay untouched.

## 6. Required external setup (cannot be done from here)
- Firebase project: Admin service-account JSON (Vercel env), Storage enabled, Email/Password + Phone enabled, App Check (reCAPTCHA) keys.
- Gemini API key (new, rotated) as a server-only env var.
- Satellite provider (e.g. Sentinel Hub) credentials; Open-Meteo works without a key.
- data.gov.in key (already optional).

## 7. Recommended sequence
1. Move Gemini behind `/api/v1/diagnosis`, `/api/v1/advisory`, `/api/v1/calendar`, `/api/v1/assistant` (fixes S1) and remove the `define` from `vite.config.ts`.
2. API foundation (auth middleware, validation, rate limit, errors, audit).
3. Roles/claims + tightened Firestore & Storage rules (S2, S3, S7, S9).
4. Farmers/farms/crops/activities + server-side diagnosis history.
5. Weather v2 (7-day, alerts, cache), profit v2 (+ saved reports).
6. Officer queries, schemes, announcements, notifications, reminders cron.
7. Admin endpoints, account deletion/export.
8. Satellite module (interface now, live once credentials exist).
9. Tests, security review, docs, Play-Store readiness checklist.
