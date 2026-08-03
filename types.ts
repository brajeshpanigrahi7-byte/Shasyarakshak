export enum Language {
  ENGLISH = 'en',
  ODIA = 'or'
}

export type Theme = 'light' | 'dark';

export type CropType = 'paddy' | 'millet' | 'auto';

export interface DiagnosisResult {
  diagnosisName: string;
  diagnosisNameOdia: string;
  confidenceScore: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  descriptionOdia: string;
  organicControls: string[];
  organicControlsOdia: string[];
  chemicalControls: string[];
  chemicalControlsOdia: string[];
  isHealthy: boolean;
}

// A single saved scan in the user's on-device history log
export interface HistoryEntry {
  id: string;
  timestamp: number;
  thumbnail: string; // small base64 jpeg for quick preview
  cropType: CropType;
  result: DiagnosisResult;
}

export interface WeatherSnapshot {
  temperatureC: number;
  humidity: number;
  windKph: number;
  rainChancePercent: number;
  condition: string;
  sprayAdvisorySafe: boolean;
  fetchedAt: number;
}

export interface UIContent {
  title: string;
  subtitle: string;
  uploadButton: string;
  analyzing: string;
  results: string;
  severity: string;
  confidence: string;
  organic: string;
  chemical: string;
  kvkContact: string;
  kvkLinkText: string;
  selectImage: string;
  takePhoto: string;
  retry: string;
  home: string;
  // KVK Finder Specific
  kvkSearchLabel: string;
  kvkSearchPlaceholder: string;
  phone: string;
  email: string;
  address: string;
  callNow: string;
  noResults: string;
  savedCenter: string;
  save: string;
  remove: string;
  // Navigation
  navHome: string;
  navHistory: string;
  navWeather: string;
  navSettings: string;
  // Weather
  weatherTitle: string;
  weatherHumidity: string;
  weatherWind: string;
  weatherRainChance: string;
  weatherSpraySafe: string;
  weatherSprayUnsafe: string;
  weatherLoading: string;
  weatherDenied: string;
  weatherRetry: string;
  // History
  historyTitle: string;
  historyEmpty: string;
  historyEmptyHint: string;
  historyClearAll: string;
  historyDelete: string;
  historyConfirmClear: string;
  // Crop selector
  cropSelectLabel: string;
  cropPaddy: string;
  cropMillet: string;
  cropAuto: string;
  // Result actions
  listen: string;
  stopListening: string;
  share: string;
  shareCopied: string;
  // Settings
  settingsTitle: string;
  darkMode: string;
  lightMode: string;
  offlineNotice: string;
  aboutApp: string;
  clearData: string;
  appVersion: string;
}