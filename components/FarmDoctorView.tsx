import React, { useEffect, useState } from 'react';
import { Stethoscope, RefreshCw, AlertTriangle, Edit3 } from 'lucide-react';
import { UIContent, Language, FarmProfile, FarmDoctorAdvisory, SoilType, CropType, WeatherSnapshot } from '../types';
import { getFarmProfile, saveFarmProfile, getCachedAdvisory, cacheAdvisory } from '../services/farmProfileService';
import { generateFarmDoctorAdvisory } from '../services/geminiService';
import { fetchWeatherForCurrentLocation } from '../services/weatherService';

interface FarmDoctorViewProps {
  content: UIContent;
  lang: Language;
}

const riskColors: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  High: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

const FarmDoctorView: React.FC<FarmDoctorViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const [profile, setProfile] = useState<FarmProfile | null>(() => getFarmProfile());
  const [editing, setEditing] = useState(!getFarmProfile());
  const [advisory, setAdvisory] = useState<FarmDoctorAdvisory | null>(() => getCachedAdvisory());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FarmProfile>(
    profile || {
      district: '',
      cropType: 'paddy' as CropType,
      sowingDate: new Date().toISOString().slice(0, 10),
      soilType: 'unknown' as SoilType,
      pastIssues: [],
    }
  );

  const generate = async (currentProfile: FarmProfile) => {
    setLoading(true);
    setError('');
    try {
      let weather: WeatherSnapshot | null = null;
      try {
        weather = await fetchWeatherForCurrentLocation();
      } catch {
        weather = null; // Advisory still works without weather, just less precise.
      }
      const result = await generateFarmDoctorAdvisory(currentProfile, weather);
      setAdvisory(result);
      cacheAdvisory(result);
    } catch (err) {
      setError(
        isOdia ? 'ପରାମର୍ଶ ତିଆରି କରିବାରେ ତ୍ରୁଟି। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Could not generate advisory. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !advisory) {
      generate(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = () => {
    saveFarmProfile(form);
    setProfile(form);
    setEditing(false);
    generate(form);
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 ${isOdia ? 'font-odia' : ''}`}>
          {content.farmProfileSetup}
        </h2>
        <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.farmProfileDistrict}
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Cuttack"
            />
          </div>

          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.cropSelectLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['paddy', 'millet'] as CropType[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, cropType: c })}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    form.cropType === c
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                  } ${isOdia ? 'font-odia' : ''}`}
                >
                  {c === 'paddy' ? content.cropPaddy : content.cropMillet}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.farmProfileSowingDate}
            </label>
            <input
              type="date"
              value={form.sowingDate}
              onChange={(e) => setForm({ ...form, sowingDate: e.target.value })}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.farmProfileSoilType}
            </label>
            <select
              value={form.soilType}
              onChange={(e) => setForm({ ...form, soilType: e.target.value as SoilType })}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="alluvial">{content.soilAlluvial}</option>
              <option value="laterite">{content.soilLaterite}</option>
              <option value="clay">{content.soilClay}</option>
              <option value="sandy">{content.soilSandy}</option>
              <option value="unknown">{content.soilUnknown}</option>
            </select>
          </div>

          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.farmProfilePastIssues}
            </label>
            <input
              type="text"
              value={form.pastIssues.join(', ')}
              onChange={(e) => setForm({ ...form, pastIssues: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder={content.farmProfilePastIssuesPlaceholder}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className={`w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
          >
            {content.farmProfileSave}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-rose-600" />
          <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>
            {content.farmDoctorTitle}
          </h2>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-700"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {content.farmDoctorEditProfile}
        </button>
      </div>

      {loading && (
        <div className={`flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 gap-3 ${isOdia ? 'font-odia' : ''}`}>
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          {content.farmDoctorGenerating}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-5 text-center">
          <p className={`text-red-700 dark:text-red-300 text-sm mb-3 ${isOdia ? 'font-odia' : ''}`}>{error}</p>
          <button
            onClick={() => profile && generate(profile)}
            className={`text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-lg ${isOdia ? 'font-odia' : ''}`}
          >
            {content.farmDoctorRefresh}
          </button>
        </div>
      )}

      {!loading && !error && advisory && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${riskColors[advisory.riskLevel]}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {advisory.riskLevel === 'Low' ? content.riskLow : advisory.riskLevel === 'Medium' ? content.riskMedium : content.riskHigh}
          </div>
          <h3 className={`text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 ${isOdia ? 'font-odia' : ''}`}>
            {isOdia ? advisory.headlineOdia : advisory.headline}
          </h3>
          <p className={`text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 ${isOdia ? 'font-odia' : ''}`}>
            {isOdia ? advisory.reasoningOdia : advisory.reasoning}
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
            <p className={`text-emerald-900 dark:text-emerald-200 font-semibold text-sm ${isOdia ? 'font-odia' : ''}`}>
              {isOdia ? advisory.recommendedActionOdia : advisory.recommendedAction}
            </p>
          </div>
          <button
            onClick={() => profile && generate(profile)}
            className={`flex items-center gap-1.5 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-700 ${isOdia ? 'font-odia' : ''}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {content.farmDoctorRefresh}
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmDoctorView;
