import React, { useState, useEffect } from 'react';
import { DiagnosisResult, UIContent, Language } from '../types';
import { AlertTriangle, CheckCircle, Droplets, FlaskConical, MapPin, AlertOctagon, Volume2, VolumeX, Share2, Check } from 'lucide-react';
import KVKFinder from './KVKFinder';
import { speak, stopSpeaking, isSpeechSupported } from '../services/speechService';

interface AnalysisResultViewProps {
  result: DiagnosisResult;
  content: UIContent;
  lang: Language;
  onRetry: () => void;
  showKvk?: boolean;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, content, lang, onRetry, showKvk = true }) => {
  const isOdia = lang === Language.ODIA;
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const buildSpeechText = () => {
    const name = isOdia ? result.diagnosisNameOdia : result.diagnosisName;
    const desc = isOdia ? result.descriptionOdia : result.description;
    const controls = (isOdia ? result.organicControlsOdia : result.organicControls).join('. ');
    return `${name}. ${desc}. ${controls}`;
  };

  const toggleListen = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(buildSpeechText(), lang, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  const buildReportText = () => {
    const name = isOdia ? result.diagnosisNameOdia : result.diagnosisName;
    const desc = isOdia ? result.descriptionOdia : result.description;
    const organic = (isOdia ? result.organicControlsOdia : result.organicControls).map((c) => `- ${c}`).join('\n');
    const chemical = (isOdia ? result.chemicalControlsOdia : result.chemicalControls).map((c) => `- ${c}`).join('\n');
    return `Shasyarakshak ${content.results}\n\n${name}\n${content.confidence}: ${result.confidenceScore}%\n\n${desc}\n\n${content.organic}:\n${organic}\n\n${content.chemical}:\n${chemical}`;
  };

  const handleShare = async () => {
    const text = buildReportText();
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, text });
        return;
      }
    } catch {
      // fall through to clipboard copy
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };
  
  // Severity Color Mapping
  const severityColors = {
    Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Medium: 'bg-orange-100 text-orange-800 border-orange-200',
    High: 'bg-red-100 text-red-800 border-red-200',
  };

  const getSeverityLabel = (severity: string) => {
    if (!isOdia) return severity;
    if (severity === 'Low') return 'କମ୍';
    if (severity === 'Medium') return 'ମଧ୍ୟମ';
    return 'ଅଧିକ';
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
      {/* Header Status */}
      <div className={`p-6 rounded-b-3xl shadow-sm mb-6 ${result.isHealthy ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex items-center gap-3 mb-2">
            {result.isHealthy ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
                <AlertOctagon className="w-8 h-8 text-red-600" />
            )}
            <h2 className={`text-2xl font-bold ${result.isHealthy ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'} ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? result.diagnosisNameOdia : result.diagnosisName}
            </h2>
        </div>
        
        {/* Confidence & Severity Badges */}
        <div className="flex flex-wrap gap-3 mt-2">
            {!result.isHealthy && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${severityColors[result.severity]}`}>
                    {content.severity}: {getSeverityLabel(result.severity)}
                </span>
            )}
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {content.confidence}: {result.confidenceScore}%
            </span>
        </div>

        {/* Listen & Share Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
            {isSpeechSupported() && (
                <button
                    onClick={toggleListen}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
                >
                    {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {speaking ? content.stopListening : content.listen}
                </button>
            )}
            <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
            >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? content.shareCopied : content.share}
            </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Description */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className={`text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? 'ରୋଗ ବିଷୟରେ' : 'About the Condition'}
            </h3>
            <p className={`text-slate-600 dark:text-slate-300 leading-relaxed ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? result.descriptionOdia : result.description}
            </p>
        </div>

        {/* Treatments */}
        {!result.isHealthy && (
            <>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-emerald-600" />
                        <h3 className={`text-lg font-bold text-emerald-800 dark:text-emerald-300 ${isOdia ? 'font-odia' : ''}`}>
                            {content.organic}
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {(isOdia ? result.organicControlsOdia : result.organicControls).map((control, idx) => (
                            <li key={idx} className={`flex items-start gap-2 text-emerald-900 dark:text-emerald-200 ${isOdia ? 'font-odia' : ''}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span>{control}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="w-5 h-5 text-blue-600" />
                        <h3 className={`text-lg font-bold text-blue-800 dark:text-blue-300 ${isOdia ? 'font-odia' : ''}`}>
                            {content.chemical}
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {(isOdia ? result.chemicalControlsOdia : result.chemicalControls).map((control, idx) => (
                            <li key={idx} className={`flex items-start gap-2 text-blue-900 dark:text-blue-200 ${isOdia ? 'font-odia' : ''}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                <span>{control}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )}

        {/* KVK Finder Component */}
        {showKvk && <KVKFinder content={content} lang={lang} />}
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
        <div className="max-w-2xl mx-auto">
            <button
                onClick={onRetry}
                className={`w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
            >
                {content.retry}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;