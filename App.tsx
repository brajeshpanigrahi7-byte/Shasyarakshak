import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResultView from './components/AnalysisResultView';
import BottomNav, { Tab } from './components/BottomNav';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import WeatherWidget from './components/WeatherWidget';
import { analyzeCropImage } from './services/geminiService';
import { getHistory, saveHistoryEntry, deleteHistoryEntry, clearHistory } from './services/historyService';
import { DiagnosisResult, Language, CropType, HistoryEntry, Theme } from './types';
import { UI_TRANSLATIONS } from './constants';
import { Loader2, WifiOff } from 'lucide-react';

enum AppState {
  IDLE,
  ANALYZING,
  RESULT,
  ERROR
}

const THEME_KEY = 'shasya_theme';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ODIA); // Default to Odia for target audience
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<HistoryEntry | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const content = UI_TRANSLATIONS[lang];

  // Apply/remove Tailwind's dark class on <html> and persist the choice.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Load saved scans once on mount.
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Track online/offline status so we can warn the user (AI analysis needs network).
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleImageSelected = async (base64Data: string, cropType: CropType) => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeCropImage(base64Data, cropType);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
      const updated = await saveHistoryEntry(result, base64Data, cropType);
      setHistory(updated);
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
    setViewingHistoryEntry(null);
    setActiveTab('home');
  };

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setViewingHistoryEntry(entry);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory(deleteHistoryEntry(id));
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleClearAllData = () => {
    clearHistory();
    setHistory([]);
    localStorage.removeItem('shasya_kvk_district');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header 
        lang={lang} 
        content={content} 
        onLangChange={setLang} 
      />

      {isOffline && (
        <div className={`bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-sm px-4 py-2 flex items-center justify-center gap-2 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
          <WifiOff className="w-4 h-4" />
          {content.offlineNotice}
        </div>
      )}

      <main>
        {/* Viewing a past scan from history */}
        {viewingHistoryEntry && (
          <AnalysisResultView
            result={viewingHistoryEntry.result}
            content={content}
            lang={lang}
            onRetry={() => setViewingHistoryEntry(null)}
            showKvk={true}
          />
        )}

        {!viewingHistoryEntry && activeTab === 'home' && (
          <>
            {appState === AppState.IDLE && (
              <div className="flex flex-col items-center justify-center pt-8 md:pt-16 animate-fade-in pb-24">
                <div className="text-center px-6 mb-8 max-w-lg">
                    <h2 className={`text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-3 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                        {lang === Language.ODIA ? 'ଆପଣଙ୍କ ଫସଲ ସୁରକ୍ଷିତ କରନ୍ତୁ' : 'Protect Your Crop'}
                    </h2>
                    <p className={`text-emerald-700 dark:text-emerald-400 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
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
                <div className="w-full max-w-md mx-auto px-4 mt-2">
                  <WeatherWidget content={content} lang={lang} />
                </div>
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
                <h2 className={`text-xl font-semibold text-slate-800 dark:text-slate-100 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                  {content.analyzing}
                </h2>
                <p className={`text-slate-500 dark:text-slate-400 mt-2 max-w-xs ${lang === Language.ODIA ? 'font-odia' : ''}`}>
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
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h3 className={`text-xl font-bold text-red-700 dark:text-red-400 mb-2 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
                    {lang === Language.ODIA ? 'ତ୍ରୁଟି' : 'Error'}
                </h3>
                <p className={`text-slate-600 dark:text-slate-300 mb-8 max-w-sm mx-auto ${lang === Language.ODIA ? 'font-odia' : ''}`}>
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
          </>
        )}

        {!viewingHistoryEntry && activeTab === 'history' && (
          <HistoryView
            entries={history}
            content={content}
            lang={lang}
            onSelect={handleSelectHistoryEntry}
            onDelete={handleDeleteHistoryEntry}
            onClearAll={handleClearHistory}
          />
        )}

        {!viewingHistoryEntry && activeTab === 'weather' && (
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
            <WeatherWidget content={content} lang={lang} />
          </div>
        )}

        {!viewingHistoryEntry && activeTab === 'settings' && (
          <SettingsView
            content={content}
            lang={lang}
            theme={theme}
            onToggleTheme={toggleTheme}
            onClearData={handleClearAllData}
          />
        )}
      </main>

      {!viewingHistoryEntry && appState !== AppState.ANALYZING && appState !== AppState.RESULT && (
        <BottomNav active={activeTab} onChange={setActiveTab} content={content} lang={lang} />
      )}
    </div>
  );
};

export default App;
