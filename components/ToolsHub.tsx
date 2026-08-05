import React from 'react';
import { Stethoscope, Mic, CalendarDays, Calculator, Satellite, ChevronRight, LineChart, Users, ClipboardList } from 'lucide-react';
import { UIContent, Language } from '../types';
import { Screen } from '../App';

interface ToolsHubProps {
  content: UIContent;
  lang: Language;
  onNavigate: (screen: Screen) => void;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ content, lang, onNavigate }) => {
  const isOdia = lang === Language.ODIA;

  const tools: { screen: Screen; icon: React.ReactNode; title: string; desc: string; color: string }[] = [
    {
      screen: 'farmDoctor',
      icon: <Stethoscope className="w-5 h-5" />,
      title: content.toolFarmDoctor,
      desc: content.toolFarmDoctorDesc,
      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    },
    {
      screen: 'voiceAssistant',
      icon: <Mic className="w-5 h-5" />,
      title: content.toolVoiceAssistant,
      desc: content.toolVoiceAssistantDesc,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    {
      screen: 'cropCalendar',
      icon: <CalendarDays className="w-5 h-5" />,
      title: content.toolCropCalendar,
      desc: content.toolCropCalendarDesc,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    {
      screen: 'profitCalculator',
      icon: <Calculator className="w-5 h-5" />,
      title: content.toolProfitCalculator,
      desc: content.toolProfitCalculatorDesc,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
      screen: 'mandiPrices',
      icon: <LineChart className="w-5 h-5" />,
      title: content.toolMandiPrices,
      desc: content.toolMandiPricesDesc,
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    },
    {
      screen: 'community',
      icon: <Users className="w-5 h-5" />,
      title: content.toolCommunity,
      desc: content.toolCommunityDesc,
      color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    },
    {
      screen: 'officerDashboard',
      icon: <ClipboardList className="w-5 h-5" />,
      title: content.toolOfficerDashboard,
      desc: content.toolOfficerDashboardDesc,
      color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    },
    {
      screen: 'fieldMonitor',
      icon: <Satellite className="w-5 h-5" />,
      title: content.toolFieldMonitor,
      desc: content.toolFieldMonitorDesc,
      color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    },
  ];

  return (
    <div className="w-full">
      <h3 className={`text-base font-bold text-slate-700 dark:text-slate-200 mb-3 px-1 ${isOdia ? 'font-odia' : ''}`}>
        {content.toolsTitle}
      </h3>
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.screen}
            onClick={() => onNavigate(tool.screen)}
            className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}>
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-slate-800 dark:text-slate-100 text-sm ${isOdia ? 'font-odia' : ''}`}>
                {tool.title}
              </p>
              <p className={`text-xs text-slate-500 dark:text-slate-400 truncate ${isOdia ? 'font-odia' : ''}`}>
                {tool.desc}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsHub;
