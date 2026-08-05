export enum Language {
  ENGLISH = 'en',
  ODIA = 'or'
}

export type Theme = 'light' | 'dark';

export type CropType = 'paddy' | 'millet' | 'vegetable' | 'other' | 'auto';

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

// ---- Farm Doctor (personalized proactive advisory) ----
export type SoilType = 'alluvial' | 'laterite' | 'clay' | 'sandy' | 'unknown';

export interface FarmProfile {
  district: string;
  cropType: CropType;
  sowingDate: string; // ISO date string
  soilType: SoilType;
  pastIssues: string[]; // free-text history like "Blast last season"
}

export interface FarmDoctorAdvisory {
  headline: string;
  headlineOdia: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reasoning: string;
  reasoningOdia: string;
  recommendedAction: string;
  recommendedActionOdia: string;
  generatedAt: number;
}

// ---- AI Voice/Chat Assistant ----
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

// ---- AI Crop Calendar ----
export interface CropCalendarTask {
  id: string;
  dayOffset: number; // days after sowing
  date: string; // computed ISO date
  category: 'fertilizer' | 'irrigation' | 'pest' | 'harvest' | 'other';
  title: string;
  titleOdia: string;
  detail: string;
  detailOdia: string;
}

export interface CropCalendarPlan {
  crop: string;
  sowingDate: string;
  harvestEstimateDate: string;
  tasks: CropCalendarTask[];
  generatedAt: number;
}

// ---- Profit Predictor ----
export interface ProfitCalcInput {
  landAreaAcres: number;
  crop: string;
  expectedYieldQuintalsPerAcre: number;
  pricePerQuintal: number;
  fertilizerCost: number;
  labourCost: number;
  otherCost: number;
}

export interface ProfitCalcResult {
  totalYieldQuintals: number;
  totalIncome: number;
  totalInvestment: number;
  profit: number;
  breakEvenYieldQuintals: number;
  breakEvenPricePerQuintal: number;
}

// ---- Field Monitor (satellite roadmap placeholder) ----
export interface FieldLocation {
  label: string;
  latitude: number;
  longitude: number;
  savedAt: number;
}

// ---- Live Mandi (Market) Prices — from the real data.gov.in Agmarknet dataset ----
export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

// ---- Community Q&A (Firestore-backed, district-level) ----
export interface CommunityPost {
  id: string;
  district: string;
  cropType: CropType;
  question: string;
  authorLabel: string; // e.g. "Farmer from Cuttack" — no real identity stored
  createdAt: number;
  replyCount: number;
}

export interface CommunityReply {
  id: string;
  postId: string;
  text: string;
  authorLabel: string;
  createdAt: number;
}

// ---- Officer / FPO Dashboard (aggregated anonymized diagnosis reports) ----
export interface DiagnosisReport {
  id?: string;
  district: string;
  cropType: CropType;
  diagnosisName: string;
  severity: 'Low' | 'Medium' | 'High';
  isHealthy: boolean;
  createdAt: number;
}

export interface DistrictAggregate {
  district: string;
  totalReports: number;
  diseaseCounts: Record<string, number>;
  highSeverityCount: number;
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
  // Tools hub
  toolsTitle: string;
  toolFarmDoctor: string;
  toolFarmDoctorDesc: string;
  toolVoiceAssistant: string;
  toolVoiceAssistantDesc: string;
  toolCropCalendar: string;
  toolCropCalendarDesc: string;
  toolProfitCalculator: string;
  toolProfitCalculatorDesc: string;
  toolFieldMonitor: string;
  toolFieldMonitorDesc: string;
  back: string;
  // Farm Doctor
  farmDoctorTitle: string;
  farmProfileSetup: string;
  farmProfileDistrict: string;
  farmProfileSowingDate: string;
  farmProfileSoilType: string;
  farmProfilePastIssues: string;
  farmProfilePastIssuesPlaceholder: string;
  farmProfileSave: string;
  soilAlluvial: string;
  soilLaterite: string;
  soilClay: string;
  soilSandy: string;
  soilUnknown: string;
  farmDoctorGenerating: string;
  farmDoctorRefresh: string;
  farmDoctorNoProfile: string;
  farmDoctorEditProfile: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  // Voice assistant
  voiceAssistantTitle: string;
  voiceAssistantPlaceholder: string;
  voiceAssistantListening: string;
  voiceAssistantSend: string;
  voiceAssistantMicUnsupported: string;
  voiceAssistantThinking: string;
  // Crop calendar
  cropCalendarTitle: string;
  cropCalendarCropName: string;
  cropCalendarCropPlaceholder: string;
  cropCalendarSowingDate: string;
  cropCalendarGenerate: string;
  cropCalendarGenerating: string;
  cropCalendarHarvestEstimate: string;
  catFertilizer: string;
  catIrrigation: string;
  catPest: string;
  catHarvest: string;
  catOther: string;
  // Profit calculator
  profitTitle: string;
  profitLandArea: string;
  profitCrop: string;
  profitExpectedYield: string;
  profitPricePerQuintal: string;
  profitFertilizerCost: string;
  profitLabourCost: string;
  profitOtherCost: string;
  profitCalculate: string;
  profitTotalYield: string;
  profitTotalIncome: string;
  profitTotalInvestment: string;
  profitEstimate: string;
  profitBreakEvenYield: string;
  profitBreakEvenPrice: string;
  // Field monitor
  fieldMonitorTitle: string;
  fieldMonitorIntro: string;
  fieldMonitorSaveLocation: string;
  fieldMonitorSaved: string;
  fieldMonitorRoadmap: string;
  // Multi-crop
  cropVegetable: string;
  cropOther: string;
  cropOtherPlaceholder: string;
  // Mandi prices
  toolMandiPrices: string;
  toolMandiPricesDesc: string;
  mandiTitle: string;
  mandiSearchPlaceholder: string;
  mandiSearch: string;
  mandiState: string;
  mandiMarket: string;
  mandiMinPrice: string;
  mandiMaxPrice: string;
  mandiModalPrice: string;
  mandiDate: string;
  mandiNoResults: string;
  mandiNotConfigured: string;
  mandiUseInCalculator: string;
  mandiLoading: string;
  // Community Q&A
  toolCommunity: string;
  toolCommunityDesc: string;
  communityTitle: string;
  communityAskPlaceholder: string;
  communityPost: string;
  communityReplies: string;
  communityReplyPlaceholder: string;
  communitySendReply: string;
  communityEmpty: string;
  communityNotConfigured: string;
  communityDistrictRequired: string;
  // Officer dashboard
  toolOfficerDashboard: string;
  toolOfficerDashboardDesc: string;
  officerTitle: string;
  officerTotalReports: string;
  officerHighSeverity: string;
  officerTopDiseases: string;
  officerNoData: string;
  shareDataToggle: string;
  shareDataToggleDesc: string;
  // SMS / IVR
  smsFallbackTitle: string;
  smsFallbackDesc: string;
  smsFallbackNotConfigured: string;
}