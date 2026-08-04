import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { UIContent, Language, ProfitCalcInput, ProfitCalcResult } from '../types';
import { calculateProfit } from '../services/profitService';

interface ProfitCalculatorViewProps {
  content: UIContent;
  lang: Language;
}

const defaultInput: ProfitCalcInput = {
  landAreaAcres: 1,
  crop: '',
  expectedYieldQuintalsPerAcre: 0,
  pricePerQuintal: 0,
  fertilizerCost: 0,
  labourCost: 0,
  otherCost: 0,
};

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  odia: boolean;
  min?: number;
}> = ({ label, value, onChange, odia, min = 0 }) => (
  <div>
    <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${odia ? 'font-odia' : ''}`}>{label}</label>
    <input
      type="number"
      min={min}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

const ProfitCalculatorView: React.FC<ProfitCalculatorViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const [input, setInput] = useState<ProfitCalcInput>(defaultInput);
  const [result, setResult] = useState<ProfitCalcResult | null>(null);

  const handleCalculate = () => setResult(calculateProfit(input));

  const inr = (n: number) =>
    `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-5 space-y-4">
        <div>
          <label className={`text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block ${isOdia ? 'font-odia' : ''}`}>
            {content.profitCrop}
          </label>
          <input
            type="text"
            value={input.crop}
            onChange={(e) => setInput({ ...input, crop: e.target.value })}
            placeholder="e.g. Paddy"
            className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={content.profitLandArea}
            value={input.landAreaAcres}
            onChange={(v) => setInput({ ...input, landAreaAcres: v })}
            odia={isOdia}
          />
          <NumberField
            label={content.profitExpectedYield}
            value={input.expectedYieldQuintalsPerAcre}
            onChange={(v) => setInput({ ...input, expectedYieldQuintalsPerAcre: v })}
            odia={isOdia}
          />
        </div>
        <NumberField
          label={content.profitPricePerQuintal}
          value={input.pricePerQuintal}
          onChange={(v) => setInput({ ...input, pricePerQuintal: v })}
          odia={isOdia}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberField
            label={content.profitFertilizerCost}
            value={input.fertilizerCost}
            onChange={(v) => setInput({ ...input, fertilizerCost: v })}
            odia={isOdia}
          />
          <NumberField
            label={content.profitLabourCost}
            value={input.labourCost}
            onChange={(v) => setInput({ ...input, labourCost: v })}
            odia={isOdia}
          />
          <NumberField
            label={content.profitOtherCost}
            value={input.otherCost}
            onChange={(v) => setInput({ ...input, otherCost: v })}
            odia={isOdia}
          />
        </div>
        <button
          onClick={handleCalculate}
          className={`w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
        >
          {content.profitCalculate}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-5 border flex items-center gap-4 ${
              result.profit >= 0
                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800'
            }`}
          >
            {result.profit >= 0 ? (
              <TrendingUp className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600 shrink-0" />
            )}
            <div>
              <p className={`text-xs ${result.profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'} ${isOdia ? 'font-odia' : ''}`}>
                {content.profitEstimate}
              </p>
              <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                {inr(result.profit)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
              <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.profitTotalYield}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{result.totalYieldQuintals.toFixed(1)} q</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
              <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.profitTotalIncome}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{inr(result.totalIncome)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
              <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.profitTotalInvestment}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{inr(result.totalInvestment)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
              <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.profitBreakEvenYield}</p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{result.breakEvenYieldQuintals.toFixed(1)} q</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <p className={`text-xs text-slate-500 dark:text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.profitBreakEvenPrice}</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{inr(result.breakEvenPricePerQuintal)} / quintal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitCalculatorView;
