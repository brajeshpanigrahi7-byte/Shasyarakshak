import React, { useState } from 'react';
import { Sprout, Droplets, Bug, Wheat, CalendarClock, RefreshCw } from 'lucide-react';
import { UIContent, Language, CropCalendarPlan } from '../types';
import { generateCropCalendar } from '../services/geminiService';

interface CropCalendarViewProps {
  content: UIContent;
  lang: Language;
}

const categoryIcon: Record<string, React.ReactNode> = {
  fertilizer: <Sprout className="w-4 h-4" />,
  irrigation: <Droplets className="w-4 h-4" />,
  pest: <Bug className="w-4 h-4" />,
  harvest: <Wheat className="w-4 h-4" />,
  other: <CalendarClock className="w-4 h-4" />,
};

const categoryColor: Record<string, string> = {
  fertilizer: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  irrigation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  pest: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  harvest: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const CropCalendarView: React.FC<CropCalendarViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const [crop, setCrop] = useState('Paddy');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().slice(0, 10));
  const [plan, setPlan] = useState<CropCalendarPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryLabel = (cat: string) =>
    cat === 'fertilizer'
      ? content.catFertilizer
      : cat === 'irrigation'
      ? content.catIrrigation
      : cat === 'pest'
      ? content.catPest
      : cat === 'harvest'
      ? content.catHarvest
      : content.catOther;

  const handleGenerate = async () => {
    if (!crop.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateCropCalendar(crop.trim(), sowingDate);
      setPlan(result);
    } catch {
      setError(isOdia ? 'କ୍ୟାଲେଣ୍ଡର ତିଆରି କରିବାରେ ତ୍ରୁଟି। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Could not generate calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isOdia ? 'or-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.cropCalendarCropName}
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder={content.cropCalendarCropPlaceholder}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.cropCalendarSowingDate}
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${isOdia ? 'font-odia' : ''}`}
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? content.cropCalendarGenerating : content.cropCalendarGenerate}
        </button>
        {error && <p className={`text-red-600 text-sm mt-3 ${isOdia ? 'font-odia' : ''}`}>{error}</p>}
      </div>

      {plan && (
        <div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <Wheat className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className={`text-xs text-amber-700 dark:text-amber-400 ${isOdia ? 'font-odia' : ''}`}>{content.cropCalendarHarvestEstimate}</p>
              <p className="font-bold text-amber-900 dark:text-amber-200">{formatDate(plan.harvestEstimateDate)}</p>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-5">
            {plan.tasks.map((task) => (
              <div key={task.id} className="relative">
                <span
                  className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${categoryColor[task.category]}`}
                />
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor[task.category]}`}>
                    {categoryIcon[task.category]}
                    {categoryLabel(task.category)}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(task.date)}</span>
                </div>
                <p className={`font-semibold text-slate-800 dark:text-slate-100 text-sm ${isOdia ? 'font-odia' : ''}`}>
                  {isOdia ? task.titleOdia : task.title}
                </p>
                <p className={`text-sm text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>
                  {isOdia ? task.detailOdia : task.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendarView;
