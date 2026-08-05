import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getDb } from './firebaseClient';
import { DiagnosisReport, DistrictAggregate, DiagnosisResult, CropType } from '../types';

const REPORTS_COLLECTION = 'diagnosis_reports';
const OPT_IN_KEY = 'shasya_share_reports_optin';

export function getShareOptIn(): boolean {
  return localStorage.getItem(OPT_IN_KEY) === 'true';
}

export function setShareOptIn(value: boolean): void {
  localStorage.setItem(OPT_IN_KEY, value ? 'true' : 'false');
}

// Submits ONLY: district, crop type, disease name, severity, healthy flag, timestamp.
// No image, no exact location, no personal identifier — by design, so this is safe to
// aggregate and show to Officer/FPO dashboards.
export async function submitAnonymizedReport(
  district: string,
  cropType: CropType,
  result: DiagnosisResult
): Promise<void> {
  const db = getDb();
  if (!db || !district) return; // Silently skip if Firebase isn't configured or no district set.

  await addDoc(collection(db, REPORTS_COLLECTION), {
    district,
    cropType,
    diagnosisName: result.diagnosisName,
    severity: result.severity,
    isHealthy: result.isHealthy,
    createdAt: serverTimestamp(),
  });
}

export async function fetchDistrictAggregate(district: string): Promise<DistrictAggregate | null> {
  const db = getDb();
  if (!db) return null;

  const q = query(collection(db, REPORTS_COLLECTION), where('district', '==', district));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { district, totalReports: 0, diseaseCounts: {}, highSeverityCount: 0 };
  }

  const diseaseCounts: Record<string, number> = {};
  let highSeverityCount = 0;

  snap.docs.forEach((d) => {
    const data = d.data() as Omit<DiagnosisReport, 'id'> & { createdAt?: Timestamp };
    if (!data.isHealthy) {
      diseaseCounts[data.diagnosisName] = (diseaseCounts[data.diagnosisName] || 0) + 1;
    }
    if (data.severity === 'High') highSeverityCount += 1;
  });

  return {
    district,
    totalReports: snap.size,
    diseaseCounts,
    highSeverityCount,
  };
}
