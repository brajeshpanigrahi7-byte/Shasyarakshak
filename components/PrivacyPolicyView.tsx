import React from 'react';
import { Language } from '../types';

interface PrivacyPolicyViewProps {
  lang: Language;
}

// NOTE FOR THE APP OWNER: This is a practical draft, not a substitute for legal review.
// Replace every [PLACEHOLDER] below with your real details before publishing, and have
// a lawyer review it before this app handles real users at scale — especially before
// any payment or account-login features are added.
const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 prose prose-sm dark:prose-invert">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Privacy Policy</h1>
      <p className="text-xs text-slate-400 mb-6">Last updated: [DATE]</p>

      <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Who we are</h2>
          <p>
            Shasyarakshak ("the App") is provided by [BRAJESH PANIGRAHI]. If you have questions about this policy or
            your data, contact us at [shasyarakshak@gmail.com]. Our address is [ROURKELA,ODISHA].
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Crop images</strong> you upload for diagnosis, sent to Google's Gemini AI for analysis. We do not permanently store these images on our own servers; a small compressed thumbnail is kept only on your own device (browser local storage) for your scan history.</li>
            <li><strong>Location data</strong>, only when you grant permission, used for local weather advisories and (optionally) to save a field marker for you. We do not track your location continuously or in the background.</li>
            <li><strong>Farm profile details</strong> you choose to enter (district, crop, sowing date, soil type, past issues), stored on your own device unless you opt in to share anonymized reports.</li>
            <li><strong>Anonymized diagnosis reports</strong>, only if you explicitly turn on "Share anonymized reports" in Settings. This shares your district, crop type, disease name, and severity — never your image, name, or exact location — to a shared database used for the district disease dashboard.</li>
            <li><strong>Community Q&A posts</strong> you choose to write, visible to other users in your district.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">AI processing</h2>
          <p>
            Crop images and farming questions are sent to Google's Gemini API for analysis. Google's own privacy
            terms govern how they process this data during the API call. We do not use your images to train any
            model ourselves.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Third-party services we use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google Gemini API — crop diagnosis and AI features</li>
            <li>Open-Meteo — weather data (no personal data sent beyond coordinates)</li>
            <li>data.gov.in (Government of India) — public market price data</li>
            <li>Firebase (Google Cloud) — Community Q&A and anonymized district reports, if enabled</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Local storage and cookies</h2>
          <p>
            Most of your data (scan history, farm profile, theme preference) is stored only in your browser's local
            storage on your own device. It is never transmitted to us unless you explicitly opt in to share it (see
            above). Uninstalling the app or clearing your browser data removes it.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Data retention and deletion</h2>
          <p>
            You can delete all locally stored data at any time from Settings → "Clear all app data." For data you
            opted to share (Community Q&A posts, anonymized reports), contact us at [CONTACT EMAIL] to request
            deletion, and we will remove it within [X] business days.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Children's privacy</h2>
          <p>This app is not directed at children under 13, and we do not knowingly collect data from them.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Your rights</h2>
          <p>
            You may access, correct, or delete your data at any time as described above. If you are in a
            jurisdiction with additional data protection rights (e.g. GDPR, India's DPDP Act), contact us at
            [CONTACT EMAIL] to exercise them.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Changes to this policy</h2>
          <p>We may update this policy as the app evolves. Material changes will be reflected with an updated "Last updated" date above.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Contact</h2>
          <p>[BRAJESH PANIGRAHI] · [shasyarakshak@gmail.com] · [ROURKELA , ODISHA]</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
