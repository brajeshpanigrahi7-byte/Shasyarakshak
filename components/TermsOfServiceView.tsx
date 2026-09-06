import React from 'react';

// NOTE FOR THE APP OWNER: practical draft, not legal advice. Replace [PLACEHOLDER]s and
// have a lawyer review before relying on this, especially once payments/accounts exist.
const TermsOfServiceView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Terms of Service</h1>
      <p className="text-xs text-slate-400 mb-6">Last updated: 5th September</p>

      <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Acceptance</h2>
          <p>By using Shasyarakshak , you agree to these terms.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Important: AI limitations and disclaimer</h2>
          <p className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
            The App uses AI (Google Gemini) to analyze crop images and answer farming questions. <strong>AI-generated
            diagnoses and recommendations are not a substitute for professional agronomic advice.</strong> AI can be
            wrong, incomplete, or fail to detect a condition. For serious crop loss risk, high-value crops, or any
            chemical/pesticide application, verify recommendations with your local Krishi Vigyan Kendra (KVK),
            agricultural extension officer, or a licensed agronomist before acting. Always follow the product label
            and manufacturer instructions for any chemical or pesticide, and never mix chemicals without confirming
            safety with a qualified source.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Acceptable use</h2>
          <p>You agree not to misuse the App — including attempting to disrupt its operation, submitting harmful or false content in Community Q&A, or using it for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Third-party services</h2>
          <p>
            The App relies on third-party services (Google Gemini, Open-Meteo, data.gov.in, Firebase). We are not
            responsible for their availability, accuracy, or downtime. Government scheme and market price
            information is sourced from public datasets and may be delayed or incomplete — always verify with the
            official source before relying on it for a financial decision.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Community content</h2>
          <p>
            Content posted in Community Q&A reflects the views of individual users, not [APP OWNER NAME]. We do not
            verify the accuracy of user-submitted answers.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Intellectual property</h2>
          <p>You retain rights to images you upload.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Limitation of liability</h2>
          <p>
            The App is provided to the maximum extent permitted by law,
            The Owner name is not liable for crop loss, financial loss, or any other damages arising from reliance
            on AI-generated content, weather data, or third-party information provided through the App.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Changes to the service</h2>
          <p>We may modify or discontinue features at any time. We'll aim to communicate material changes where practical.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Contact</h2>
          <p>BRAJESH PANIGRAHI · shasyarakshak@gmail.com · ROURKELA,ODISHA</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServiceView;
