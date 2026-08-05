import React, { useState } from 'react';
import { Search, IndianRupee, RefreshCw, AlertCircle } from 'lucide-react';
import { UIContent, Language, MandiPriceRecord } from '../types';
import { fetchMandiPrices, isMandiApiConfigured } from '../services/mandiService';

interface MandiPricesViewProps {
  content: UIContent;
  lang: Language;
  onUsePrice?: (pricePerQuintal: number) => void;
}

const MandiPricesView: React.FC<MandiPricesViewProps> = ({ content, lang, onUsePrice }) => {
  const isOdia = lang === Language.ODIA;
  const [commodity, setCommodity] = useState('Paddy');
  const [state, setState] = useState('Odisha');
  const [records, setRecords] = useState<MandiPriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const configured = isMandiApiConfigured();

  const handleSearch = async () => {
    if (!commodity.trim() || !configured) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const results = await fetchMandiPrices(commodity.trim(), state.trim() || undefined);
      setRecords(results);
    } catch {
      setError(isOdia ? 'ମୂଲ୍ୟ ଆଣିବାରେ ତ୍ରୁଟି। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Could not fetch prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {!configured && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 mb-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className={`text-sm text-amber-800 dark:text-amber-300 ${isOdia ? 'font-odia' : ''}`}>{content.mandiNotConfigured}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.profitCrop}
            </label>
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder={content.mandiSearchPlaceholder}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
              {content.mandiState}
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!configured || loading}
          className={`w-full flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 ${isOdia ? 'font-odia' : ''}`}
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? content.mandiLoading : content.mandiSearch}
        </button>
        {error && <p className={`text-red-600 text-sm mt-3 ${isOdia ? 'font-odia' : ''}`}>{error}</p>}
      </div>

      {!loading && searched && records.length === 0 && !error && (
        <p className={`text-center text-slate-500 dark:text-slate-400 text-sm py-6 ${isOdia ? 'font-odia' : ''}`}>{content.mandiNoResults}</p>
      )}

      <div className="space-y-3">
        {records.map((r, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{r.market}, {r.district}</p>
              <span className="text-xs text-slate-400">{r.arrivalDate}</span>
            </div>
            {r.variety && <p className="text-xs text-slate-400 mb-2">{r.variety}</p>}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className={`text-[11px] text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.mandiMinPrice}</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">₹{r.minPrice}</p>
              </div>
              <div>
                <p className={`text-[11px] text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.mandiModalPrice}</p>
                <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">₹{r.modalPrice}</p>
              </div>
              <div>
                <p className={`text-[11px] text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.mandiMaxPrice}</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">₹{r.maxPrice}</p>
              </div>
            </div>
            {onUsePrice && (
              <button
                onClick={() => onUsePrice(r.modalPrice)}
                className={`w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 ${isOdia ? 'font-odia' : ''}`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                {content.mandiUseInCalculator}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MandiPricesView;
