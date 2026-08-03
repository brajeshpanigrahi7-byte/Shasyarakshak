import React, { useEffect, useState } from 'react';
import { CloudSun, Droplet, Wind, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { UIContent, Language, WeatherSnapshot } from '../types';
import { fetchWeatherForCurrentLocation } from '../services/weatherService';

interface WeatherWidgetProps {
  content: UIContent;
  lang: Language;
}

type Status = 'idle' | 'loading' | 'ready' | 'denied' | 'error';

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ content, lang }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const isOdia = lang === Language.ODIA;

  const load = async () => {
    setStatus('loading');
    try {
      const data = await fetchWeatherForCurrentLocation();
      setWeather(data);
      setStatus('ready');
    } catch (err: any) {
      if (err?.code === 1 /* PERMISSION_DENIED */) {
        setStatus('denied');
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-sky-50 dark:bg-slate-800 p-5 rounded-2xl border border-sky-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <CloudSun className="w-6 h-6 text-sky-600 dark:text-sky-400" />
        <h3 className={`text-lg font-bold text-sky-800 dark:text-sky-300 ${isOdia ? 'font-odia' : ''}`}>
          {content.weatherTitle}
        </h3>
      </div>

      {status === 'loading' && (
        <div className={`flex items-center gap-2 text-sky-700 dark:text-sky-300 text-sm py-3 ${isOdia ? 'font-odia' : ''}`}>
          <RefreshCw className="w-4 h-4 animate-spin" />
          {content.weatherLoading}
        </div>
      )}

      {(status === 'denied' || status === 'error') && (
        <div className="py-2">
          <p className={`text-sm text-sky-800 dark:text-sky-200 mb-3 ${isOdia ? 'font-odia' : ''}`}>
            {content.weatherDenied}
          </p>
          <button
            onClick={load}
            className={`text-sm font-semibold bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors ${isOdia ? 'font-odia' : ''}`}
          >
            {content.weatherRetry}
          </button>
        </div>
      )}

      {status === 'ready' && weather && (
        <div>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{weather.temperatureC}°C</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{weather.condition}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-white/70 dark:bg-slate-700/60 rounded-xl py-2">
              <Droplet className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <div className="text-xs text-slate-500 dark:text-slate-300">{content.weatherHumidity}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">{weather.humidity}%</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-700/60 rounded-xl py-2">
              <Wind className="w-4 h-4 mx-auto text-slate-500 mb-1" />
              <div className="text-xs text-slate-500 dark:text-slate-300">{content.weatherWind}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">{weather.windKph} km/h</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-700/60 rounded-xl py-2">
              <CloudSun className="w-4 h-4 mx-auto text-sky-500 mb-1" />
              <div className="text-xs text-slate-500 dark:text-slate-300">{content.weatherRainChance}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">{weather.rainChancePercent}%</div>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
              weather.sprayAdvisorySafe
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            } ${isOdia ? 'font-odia' : ''}`}
          >
            {weather.sprayAdvisorySafe ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{weather.sprayAdvisorySafe ? content.weatherSpraySafe : content.weatherSprayUnsafe}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
