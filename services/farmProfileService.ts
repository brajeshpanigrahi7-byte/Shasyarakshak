import { FarmProfile, FarmDoctorAdvisory, FieldLocation } from '../types';

const PROFILE_KEY = 'shasya_farm_profile_v1';
const ADVISORY_KEY = 'shasya_farm_advisory_v1';
const FIELD_KEY = 'shasya_field_location_v1';

export function getFarmProfile(): FarmProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as FarmProfile) : null;
  } catch {
    return null;
  }
}

export function saveFarmProfile(profile: FarmProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearFarmProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ADVISORY_KEY);
}

// Cache the last advisory so we don't re-call the AI every time the tab is opened;
// the Home screen / Farm Doctor screen can decide when it's stale enough to refresh.
export function getCachedAdvisory(): FarmDoctorAdvisory | null {
  try {
    const raw = localStorage.getItem(ADVISORY_KEY);
    return raw ? (JSON.parse(raw) as FarmDoctorAdvisory) : null;
  } catch {
    return null;
  }
}

export function cacheAdvisory(advisory: FarmDoctorAdvisory): void {
  localStorage.setItem(ADVISORY_KEY, JSON.stringify(advisory));
}

export function getFieldLocation(): FieldLocation | null {
  try {
    const raw = localStorage.getItem(FIELD_KEY);
    return raw ? (JSON.parse(raw) as FieldLocation) : null;
  } catch {
    return null;
  }
}

export function saveFieldLocation(location: FieldLocation): void {
  localStorage.setItem(FIELD_KEY, JSON.stringify(location));
}
