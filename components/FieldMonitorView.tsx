import React, { useState } from 'react';
import { Satellite, MapPin, CheckCircle2, Leaf, Droplet, Sun } from 'lucide-react';
import { UIContent, Language, FieldLocation } from '../types';
import { getFieldLocation, saveFieldLocation } from '../services/farmProfileService';
import { getCurrentPosition } from '../services/weatherService';

interface FieldMonitorViewProps {
  content: UIContent;
  lang: Language;
}

const FieldMonitorView: React.FC<FieldMonitorViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const [field, setField] = useState<FieldLocation | null>(() => getFieldLocation());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveLocation = async () => {
    setSaving(true);
    setError('');
    try {
      const pos = await getCurrentPosition();
      const location: FieldLocation = {
        label: isOdia ? 'ମୋ କ୍ଷେତ' : 'My Field',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        savedAt: Date.now(),
      };
      saveFieldLocation(location);
      setField(location);
    } catch {
      setError(isOdia ? 'ଲୋକେସନ୍ ମିଳିଲା ନାହିଁ। ଲୋକେସନ୍ ଅନୁମତି ଯାଞ୍ଚ କରନ୍ତୁ।' : 'Could not get location. Please check location permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl p-5 mb-5 text-center">
        <Satellite className="w-10 h-10 text-sky-600 mx-auto mb-3" />
        <p className={`text-sm text-sky-900 dark:text-sky-200 leading-relaxed ${isOdia ? 'font-odia' : ''}`}>
          {content.fieldMonitorIntro}
        </p>
      </div>

      {!field ? (
        <button
          onClick={handleSaveLocation}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-60 ${isOdia ? 'font-odia' : ''}`}
        >
          <MapPin className="w-5 h-5" />
          {content.fieldMonitorSaveLocation}
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
          <div className={`flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-3 ${isOdia ? 'font-odia' : ''}`}>
            <CheckCircle2 className="w-5 h-5" />
            {content.fieldMonitorSaved}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {field.latitude.toFixed(5)}, {field.longitude.toFixed(5)}
          </p>
          <button
            onClick={handleSaveLocation}
            className={`mt-3 text-xs font-medium text-slate-500 hover:text-sky-600 ${isOdia ? 'font-odia' : ''}`}
          >
            {content.fieldMonitorSaveLocation}
          </button>
        </div>
      )}

      {error && <p className={`text-red-600 text-sm mt-3 text-center ${isOdia ? 'font-odia' : ''}`}>{error}</p>}

      <div className="mt-6">
        <p className={`text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wide ${isOdia ? 'font-odia' : ''}`}>
          {isOdia ? 'ଭବିଷ୍ୟତ ସାଧନ' : 'Coming Soon'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Leaf className="w-5 h-5" />, label: isOdia ? 'ବୃକ୍ଷାବରଣ ସ୍ୱାସ୍ଥ୍ୟ' : 'Vegetation Health' },
            { icon: <Droplet className="w-5 h-5" />, label: isOdia ? 'ମାଟି ଆର୍ଦ୍ରତା' : 'Soil Moisture' },
            { icon: <Sun className="w-5 h-5" />, label: isOdia ? 'ଶୁଷ୍କ ସ୍ଥାନ' : 'Dry Patches' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center opacity-70"
            >
              <div className="text-slate-400 mx-auto mb-2 flex justify-center">{item.icon}</div>
              <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{item.label}</p>
            </div>
          ))}
        </div>
        <p className={`text-xs text-slate-400 dark:text-slate-500 mt-3 text-center ${isOdia ? 'font-odia' : ''}`}>
          {content.fieldMonitorRoadmap}
        </p>
      </div>
    </div>
  );
};

export default FieldMonitorView;
