import { HistoryEntry, DiagnosisResult, CropType } from '../types';

const HISTORY_KEY = 'shasya_history_v1';
const MAX_ENTRIES = 30;

// Downscale a base64 JPEG to a small thumbnail so localStorage doesn't fill up.
export function createThumbnail(base64Data: string, maxDim = 220): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Data);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // toDataURL includes the "data:image/jpeg;base64," prefix; strip it to stay consistent.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl.split(',')[1] || base64Data);
      };
      img.onerror = () => resolve(base64Data);
      img.src = `data:image/jpeg;base64,${base64Data}`;
    } catch {
      resolve(base64Data);
    }
  });
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(
  result: DiagnosisResult,
  originalImageBase64: string,
  cropType: CropType
): Promise<HistoryEntry[]> {
  const thumbnail = await createThumbnail(originalImageBase64);
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    thumbnail,
    cropType,
    result,
  };

  const existing = getHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Storage full — drop older entries and retry once.
    try {
      const trimmed = updated.slice(0, Math.max(5, Math.floor(updated.length / 2)));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch {
      return existing;
    }
  }
  return updated;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
