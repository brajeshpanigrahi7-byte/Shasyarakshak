import React, { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, AlertTriangle, BarChart3 } from 'lucide-react';
import { UIContent, Language, DistrictAggregate } from '../types';
import { fetchDistrictAggregate } from '../services/outbreakService';
import { isFirebaseConfigured } from '../services/communityService';
import { getFarmProfile } from '../services/farmProfileService';

interface OfficerDashboardViewProps {
  content: UIContent;
  lang: Language;
}

const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const profile = getFarmProfile();
  const [district, setDistrict] = useState(profile?.district || '');
  const [aggregate, setAggregate] = useState<DistrictAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isFirebaseConfigured();

  const load = async (d: string) => {
    if (!configured || !d.trim()) return;
    setLoading(true);
    try {
      const data = await fetchDistrictAggregate(d.trim());
      setAggregate(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (district) load(district);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!configured) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className={`text-sm text-amber-800 dark:text-amber-300 ${isOdia ? 'font-odia' : ''}`}>{content.communityNotConfigured}</p>
        </div>
      </div>
    );
  }

  const sortedDiseases: [string, number][] = aggregate
    ? (Object.entries(aggregate.diseaseCounts) as [string, number][]).sort((a, b) => b[1] - a[1])
    : [];
  const maxCount: number = sortedDiseases.length ? sortedDiseases[0][1] : 1;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(district)}
          placeholder={content.farmProfileDistrict}
          className="flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => load(district)}
          className={`px-4 rounded-lg bg-slate-800 dark:bg-emerald-600 text-white text-sm font-semibold ${isOdia ? 'font-odia' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>

      {loading && <p className="text-center text-sm text-slate-400 py-6">...</p>}

      {!loading && aggregate && aggregate.totalReports === 0 && (
        <p className={`text-center text-slate-500 dark:text-slate-400 text-sm py-10 ${isOdia ? 'font-odia' : ''}`}>{content.officerNoData}</p>
      )}

      {!loading && aggregate && aggregate.totalReports > 0 && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-slate-500 shrink-0" />
              <div>
                <p className={`text-xs text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.officerTotalReports}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{aggregate.totalReports}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className={`text-xs text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.officerHighSeverity}</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{aggregate.highSeverityCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
            <h3 className={`text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 ${isOdia ? 'font-odia' : ''}`}>
              {content.officerTopDiseases}
            </h3>
            <div className="space-y-3">
              {sortedDiseases.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{name}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.max(6, (count / maxCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {sortedDiseases.length === 0 && (
                <p className="text-xs text-slate-400">{isOdia ? 'ସମସ୍ତ ରିପୋର୍ଟ ସୁସ୍ଥ ଫସଲର' : 'All reports were healthy crops'}</p>
              )}
            </div>
          </div>
          <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center ${isOdia ? 'font-odia' : ''}`}>
            {isOdia
              ? 'ଏହା ଶସ୍ୟରକ୍ଷକ ବ୍ୟବହାରକାରୀଙ୍କ ସ୍ୱେଚ୍ଛାରେ ସେୟାର୍ କରାଯାଇଥିବା ତଥ୍ୟ ଉପରେ ଆଧାରିତ, ସରକାରୀ ତଥ୍ୟ ନୁହେଁ।'
              : "Based on data voluntarily shared by Shasyarakshak users, not official government statistics."}
          </p>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboardView;
