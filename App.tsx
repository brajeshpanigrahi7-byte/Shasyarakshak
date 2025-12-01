import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResultView from './components/AnalysisResultView';
import { analyzeCropImage } from './services/geminiService';
import { DiagnosisResult, Language } from './types';
import { UI_TRANSLATIONS } from './constants';
import { Loader2 } from 'lucide-react';

enum AppState {
  IDLE,
  ANALYZING,
  RESULT,
  ERROR
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ODIA); // Default to Odia for target audience
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const content = UI_TRANSLATIONS[lang];

  const handleImageSelected = async (base64Data: string) => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeCropImage(base64Data);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      
      let message = lang === Language.ODIA 
        ? "ବିଶ୍ଳେଷଣ ବିଫଳ ହୋଇଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।" 
        : "Analysis failed. Please try again.";

      // Robust error text extraction to handle various error object formats
      const errorText = (
        err?.message || 
        err?.toString() || 
        JSON.stringify(err) || 
        ""
      ).toLowerCase();

      // 1. Network / Connectivity Issues (handling XHR/RPC errors specifically)
      if (
        errorText.includes("fetch") || 
        errorText.includes("network") || 
        errorText.includes("offline") ||
        errorText.includes("xhr") ||
        errorText.includes("rpc")
      ) {
        message = lang === Language.ODIA 
          ? "ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗରେ ତ୍ରୁଟି। ଦୟାକରି ନେଟୱାର୍କ ଯାଞ୍ଚ କରନ୍ତୁ।"
          : "Network connection issue. Please check your internet connection.";
      } 
      // 2. Server Overload (503)
      else if (errorText.includes("503") || errorText.includes("overloaded")) {
        message = lang === Language.ODIA
          ? "ସର୍ଭର ବ୍ୟସ୍ତ ଅଛି। ଦୟାକରି କିଛି ସମୟ ପରେ ଚେଷ୍ଟା କରନ୍ତୁ।"
          : "Service is temporarily busy. Please try again in a moment.";
      } 
      // 3. Safety Filters (Model refusal)
      else if (
        errorText.includes("safety") || 
        errorText.includes("blocked") || 
        errorText.includes("finishreason")
      ) {
        message = lang === Language.ODIA
          ? "ଏହି ଫଟୋଟି ଗ୍ରହଣଯୋଗ୍ୟ ନୁହେଁ। ଅନ୍ୟ ଏକ ଫଟୋ ଚେଷ୍ଟା କରନ୍ତୁ।"
          : "Image flagged by safety filters. Please ensure the image contains only crops.";
      } 
      // 4. Parsing Errors (Often due to blurry/unclear images causing model to hallucinate or return text instead of JSON)
      else if (
        errorText.includes("json") || 
        errorText.includes("syntax") || 
        errorText.includes("parse") ||
        errorText.includes("unexpected token") ||
        errorText.includes("valid json")
      ) {
        message = lang === Language.ODIA
          ? "ଫଟୋଟି ଅସ୍ପଷ୍ଟ ଥାଇପାରେ। ଦୟାକରି ଭଲ ଆଲୋକରେ ପୁଣି ଫଟୋ ନିଅନ୍ତୁ।"
          : "Could not interpret image clearly. It may be blurry. Please take a clear photo of the crop leaf.";
      }
      // 5. Permission / API Key
      else if (errorText.includes("403") || errorText.includes("key")) {
          message = lang === Language.ODIA
          ? "ସେବା ଉପଲବ୍ଧ ନାହିଁ (API Error)।"
          : "Service unavailable (API Key Error).";
      }

      setErrorMsg(message);
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        lang={lang} 
        content={content} 
        onLangChange={setLang} 
      />

      <main>
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center pt-8 md:pt-16 animate-fade-in">
            <div className="text-center px-6 mb-8 max-w-lg">
                <h2 className={`text-2xl font-bold text-emerald-900 mb-3 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                    {lang === Language.ODIA ? 'ଆପଣଙ୍କ ଫସଲ ସୁରକ୍ଷିତ କରନ୍ତୁ' : 'Protect Your Crop'}
                </h2>
                <p className={`text-emerald-700 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                    {lang === Language.ODIA 
                        ? 'ଧାନ କିମ୍ବା ମାଣ୍ଡିଆ ଫସଲର ରୋଗ ଚିହ୍ନଟ କରିବା ପାଇଁ ଏକ ଫଟୋ ଉଠାନ୍ତୁ।'
                        : 'Take a photo of your Paddy or Millet crop to identify diseases and get instant remedies.'}
                </p>
            </div>
            <ImageUploader 
              onImageSelected={handleImageSelected} 
              content={content}
              lang={lang}
            />
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
            <h2 className={`text-xl font-semibold text-slate-800 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
              {content.analyzing}
            </h2>
            <p className={`text-slate-500 mt-2 max-w-xs ${lang === Language.ODIA ? 'font-odia' : ''}`}>
              {lang === Language.ODIA 
                ? 'କୃତ୍ରିମ ବୁଦ୍ଧିମତା (AI) ଫଟୋକୁ ଯାଞ୍ଚ କରୁଛି...' 
                : 'AI is examining the image...'}
            </p>
          </div>
        )}

        {appState === AppState.RESULT && analysisResult && (
          <AnalysisResultView 
            result={analysisResult} 
            content={content} 
            lang={lang}
            onRetry={resetApp}
          />
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
            </div>
            <h3 className={`text-xl font-bold text-red-700 mb-2 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                {lang === Language.ODIA ? 'ତ୍ରୁଟି' : 'Error'}
            </h3>
            <p className={`text-slate-600 mb-8 max-w-sm mx-auto ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                {errorMsg}
            </p>
            <button
                onClick={resetApp}
                className={`bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-emerald-700 ${lang === Language.ODIA ? 'font-odia' : ''}`}
            >
                {content.retry}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;