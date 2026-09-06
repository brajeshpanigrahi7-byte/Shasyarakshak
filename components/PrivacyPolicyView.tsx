import React from 'react';
import { Language } from '../types';

interface PrivacyPolicyViewProps {
  lang: Language;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 prose prose-sm dark:prose-invert">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Privacy Policy</h1>
      <p className="text-xs text-slate-400 mb-4">Last updated: 6 September 2026</p>

      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-6">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Shasyarakshak is an independent project and is not affiliated with, endorsed by, or operated by the
          Government of Odisha, Krishi Vigyan Kendra, or any government department, unless explicitly stated
          through written authorisation.
        </p>
      </div>

      <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Who we are</h2>
          <p>
            Shasyarakshak ("the App") is an independent, non-commercial project developed and operated by
            Brajesh Panigrahi, based in Rourkela, Odisha, India. For any question about this policy or your
            data, contact <a href="mailto:shasyarakshak@gmail.com">shasyarakshak@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">What we collect, and where it lives</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Crop images</strong> you upload for diagnosis are sent to Google's Gemini AI for analysis at the moment you request it. We do not upload or retain your original image on our own servers. A small, compressed thumbnail is kept only in your own browser's local storage, so your scan history can show a preview on your device — it never leaves your device.</li>
            <li><strong>Location data</strong>, only when you grant permission, used for local weather advisories and, if you choose, to save a field marker. We do not track your location in the background or continuously.</li>
            <li><strong>Farm profile details</strong> you enter (district, crop, sowing date, soil type, past issues) are stored on your device. If you log in with your mobile number, this profile is also synced to our Firebase database so it can follow you to a new device.</li>
            <li><strong>Mobile number</strong>, only if you choose to log in, used solely for authentication via Firebase (Google's infrastructure) and to identify your posts in Community Q&A. We do not sell or share this number.</li>
            <li><strong>Anonymized diagnosis reports</strong>, only if you explicitly enable "Share anonymized reports" in Settings. This shares your district, crop type, disease name, and severity — never your image, name, phone number, or exact coordinates — to a database used for district-level disease dashboards visible to authorised KVK officers only.</li>
            <li><strong>Community Q&A posts</strong> you choose to write, visible to other users browsing the same district.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">AI processing (Google Gemini)</h2>
          <p>
            Crop images and farming questions you submit are sent to Google's Gemini API for analysis. Google's
            own terms govern their processing of this data during the API call. We do not use your images to
            train any model ourselves, and we do not store the image after the analysis completes.
          </p>
          <p className="mt-2">
            <strong>AI limitation:</strong> Gemini's diagnosis can be wrong or incomplete. It is not a substitute
            for a qualified agriculture officer, and any chemical or pesticide guidance shown should always be
            checked against the product label and your local Krishi Vigyan Kendra before use.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Other third-party services we use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Firebase</strong> (Google Cloud) — mobile number login, Community Q&A, farm profile sync, and anonymized district reports</li>
            <li><strong>Open-Meteo</strong> — weather data; only your coordinates are sent, no personal identifiers</li>
            <li><strong>data.gov.in</strong> (Government of India open data) — public market price lookups</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Local storage on your device</h2>
          <p>
            Most of your data (scan history, farm profile if not logged in, theme preference) is stored only in
            your browser's local storage. It is never transmitted to us unless you take an explicit action
            described above (logging in, or enabling anonymized sharing). Clearing your browser data or using
            Settings → "Clear all app data" removes it immediately.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Your controls</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Delete local data</strong> — Settings → "Clear all app data," effective immediately.</li>
            <li><strong>Disable anonymized sharing</strong> — Settings → toggle "Share anonymized reports" off at any time; this only affects future scans, not a retroactive request.</li>
            <li><strong>Request deletion of cloud data</strong> (your farm profile, Community posts, or account) — email <a href="mailto:shasyarakshak@gmail.com">shasyarakshak@gmail.com</a> from the number/account in question. We aim to complete verified deletion requests within 30 days, subject to any legitimate technical or legal retention requirement.</li>
            <li><strong>Delete your account</strong> — included in the same request above.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Children's privacy</h2>
          <p>This app is not directed at children under 13, and we do not knowingly collect data from them.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Changes to this policy</h2>
          <p>We may update this policy as the app evolves. Material changes will be reflected with an updated "Last updated" date above.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Contact</h2>
          <p>Brajesh Panigrahi · <a href="mailto:shasyarakshak@gmail.com">shasyarakshak@gmail.com</a> · Rourkela, Odisha, India</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
