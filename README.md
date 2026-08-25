<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yYMPkBg1db4T1L0kToBXBnyJt7FC9wLK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional — for Community Q&A and the District Dashboard) add a free Firebase project's config as `VITE_FIREBASE_*` keys — see **Optional real-data setup** below
4. (Optional — for Live Mandi Prices) add `VITE_DATAGOVIN_API_KEY` — see below
5. Run the app:
   `npm run dev`

## Optional real-data setup

These two features work with **real, live, free government/cloud data** — but need your own free API keys, since I can't provision third-party accounts on your behalf. The app runs fine without them; each screen just shows a "not configured" notice instead.

### Live Mandi Prices (real government data)
1. Register a free account at https://data.gov.in (Sign Up → confirm email)
2. Go to **My Account → API Keys** and copy your key
3. Add to `.env.local`:
   ```
   VITE_DATAGOVIN_API_KEY=your_key_here
   ```
This pulls real daily commodity prices from the Ministry of Agriculture's AGMARKNET dataset.

### Community Q&A + District Disease Dashboard (real shared data via Firebase)
1. Go to https://console.firebase.google.com → **Add project** (free "Spark" plan is enough)
2. In your project, click the **Web (`</>`)** icon to register a web app, and copy the config values shown
3. In the Firebase console, go to **Build → Firestore Database → Create database** (start in test mode for development)
4. Add these to `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Before going live, **replace test mode with the security rules shipped in this repo** — see **Officer / KVK Login + securing Firestore** below. Test mode allows open read/write and expires after 30 days.

### Mobile Number (OTP) Login (uses the same Firebase project as above)
1. In the Firebase console, go to **Build → Authentication → Get started**
2. Click the **Sign-in method** tab → **Phone** → toggle it **Enable** → **Save**
3. Under **Authentication → Settings → Authorized domains**, add your Vercel domain (e.g. `brajesh-panigrahi.vercel.app`) so login works on your live site, not just localhost
4. **Important — real cost warning**: Firebase's free "Spark" plan includes only a small number of free SMS verifications per month. Once you exceed that (or to reliably support many farmers), Google requires upgrading to the **Blaze (pay-as-you-go)** plan — you only pay for SMS actually sent, but it is a real per-SMS cost, not free at scale. Check current pricing at https://firebase.google.com/pricing before launching this to many users.
5. No extra `.env.local` values are needed for login — it reuses the same 6 `VITE_FIREBASE_*` values from Community Q&A above.

### Officer / KVK Login + securing Firestore (uses the same Firebase project)

KVK officials and agriculture officers log in with **email + password** (not phone OTP) to see the
district disease aggregate **and** the farmers' actual questions, and to reply with a verified
"KVK Officer" badge. There is no self-signup — officer accounts are **provisioned by you (the admin)**,
which is what makes the verified badge trustworthy. Roles are enforced with no backend: a signed-in
user is treated as an officer **only if** an allowlist document exists at `officers/{their-uid}`.

**One-time provisioning per officer (≈ one per district; ~30 for Odisha):**
1. Firebase console → **Build → Authentication → Sign-in method** → enable **Email/Password**.
2. **Authentication → Users → Add user** → enter the officer's email + a temporary password → **Add user**.
3. Copy that user's **UID** (from the Users table).
4. **Build → Firestore Database → Start collection** `officers` → add a document whose **Document ID is
   exactly that UID**, with fields:
   ```
   email    (string)  officer's email
   name     (string)  e.g. "Dr. Sahoo, KVK Cuttack"
   district (string)  e.g. "Cuttack"   ← the district they oversee
   ```

**Publish the security rules (replaces test mode — do this before real officers use it):**
- Easiest: open [`firestore.rules`](firestore.rules) in this repo, copy its contents into
  Firebase console → **Firestore → Rules** → **Publish**.
- Or with the Firebase CLI: `npm i -g firebase-tools`, `firebase login`, then
  `firebase deploy --only firestore:rules` (uses the [`firebase.json`](firebase.json) here).

These rules keep the farmer flow login-optional (anyone can still read the forum and contribute
anonymized reports) while making the sensitive aggregate **officer-only**, locking the `officers`
allowlist to admin-only writes, and ensuring an "officer" reply can only be created by a real officer
so the badge can't be forged.

## Features

- **AI Crop Diagnosis** — photograph a Paddy/Millet/vegetable leaf and get an instant disease/pest diagnosis with organic & chemical remedies, in English and Odia.
- **AI Farm Doctor** — set up a farm profile (district, crop, sowing date, soil type, past issues) and get a proactive weekly risk advisory that combines crop growth stage with live local weather.
- **Voice Assistant** — ask any farming question by typing or speaking; answers come back as text and speech, in Odia or English.
- **AI Crop Calendar** — enter a crop and sowing date, get an auto-generated fertilizer/irrigation/pest-watch/harvest timeline.
- **Profit Calculator** — enter land area, expected yield, price, and costs to see projected profit and break-even numbers.
- **Live Mandi Prices** *(needs a free data.gov.in key)* — real government commodity price data by market/state.
- **Community Q&A** *(needs a free Firebase project)* — a district-level forum where farmers post questions and reply to each other.
- **District Disease Dashboard + Officer/KVK Login** *(needs Firebase)* — KVK officers log in with email/password (admin-provisioned) to see anonymized diagnosis aggregates (crop, disease, severity — never images or exact location) that farmers opt in to share from Settings, plus their district's Community Q&A queue, which they can answer with a verified "KVK Officer" badge. Enforced with real Firestore security rules; see setup above.
- **Field Monitor** — save your field's GPS location today; laid out as the foundation for future satellite-based vegetation/moisture monitoring.
- **Scan History** — every diagnosis is saved locally for later reference.
- **Local weather & spray advisory**, **dark mode**, **installable PWA** with basic offline app-shell caching.

## Roadmap ideas (to further differentiate from Plantix / Kisan Suvidha)

- Satellite (NDVI) imagery integration for the Field Monitor once a provider (e.g. Sentinel Hub) API key is available
- SMS/IVR fallback for farmers without smartphones (needs a Twilio or similar telephony account + a small backend)
- Deeper multi-crop coverage (currently: Paddy, Millet, and free-text vegetable crops)
- Firestore Cloud Functions to keep reply counts and moderation fully server-side

