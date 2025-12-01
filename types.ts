export enum Language {
  ENGLISH = 'en',
  ODIA = 'or'
}

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
}