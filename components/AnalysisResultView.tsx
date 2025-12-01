import React from 'react';
import { DiagnosisResult, UIContent, Language } from '../types';
import { AlertTriangle, CheckCircle, Droplets, FlaskConical, MapPin, AlertOctagon } from 'lucide-react';
import KVKFinder from './KVKFinder';

interface AnalysisResultViewProps {
  result: DiagnosisResult;
  content: UIContent;
  lang: Language;
  onRetry: () => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, content, lang, onRetry }) => {
  const isOdia = lang === Language.ODIA;
  
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
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header Status */}
      <div className={`p-6 rounded-b-3xl shadow-sm mb-6 ${result.isHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center gap-3 mb-2">
            {result.isHealthy ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
                <AlertOctagon className="w-8 h-8 text-red-600" />
            )}
            <h2 className={`text-2xl font-bold ${result.isHealthy ? 'text-green-800' : 'text-red-800'} ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? result.diagnosisNameOdia : result.diagnosisName}
            </h2>
        </div>
        
        {/* Confidence & Severity Badges */}
        <div className="flex gap-3 mt-2">
            {!result.isHealthy && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${severityColors[result.severity]}`}>
                    {content.severity}: {getSeverityLabel(result.severity)}
                </span>
            )}
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {content.confidence}: {result.confidenceScore}%
            </span>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Description */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className={`text-lg font-semibold text-slate-800 mb-2 ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? 'ରୋଗ ବିଷୟରେ' : 'About the Condition'}
            </h3>
            <p className={`text-slate-600 leading-relaxed ${isOdia ? 'font-odia' : ''}`}>
                {isOdia ? result.descriptionOdia : result.description}
            </p>
        </div>

        {/* Treatments */}
        {!result.isHealthy && (
            <>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-emerald-600" />
                        <h3 className={`text-lg font-bold text-emerald-800 ${isOdia ? 'font-odia' : ''}`}>
                            {content.organic}
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {(isOdia ? result.organicControlsOdia : result.organicControls).map((control, idx) => (
                            <li key={idx} className={`flex items-start gap-2 text-emerald-900 ${isOdia ? 'font-odia' : ''}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span>{control}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="w-5 h-5 text-blue-600" />
                        <h3 className={`text-lg font-bold text-blue-800 ${isOdia ? 'font-odia' : ''}`}>
                            {content.chemical}
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {(isOdia ? result.chemicalControlsOdia : result.chemicalControls).map((control, idx) => (
                            <li key={idx} className={`flex items-start gap-2 text-blue-900 ${isOdia ? 'font-odia' : ''}`}>
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                <span>{control}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )}

        {/* KVK Finder Component */}
        <KVKFinder content={content} lang={lang} />
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto">
            <button
                onClick={onRetry}
                className={`w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-slate-800 transition-colors ${isOdia ? 'font-odia' : ''}`}
            >
                {content.retry}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;