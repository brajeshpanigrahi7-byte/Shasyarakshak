import { DiagnosisResult, CropType, FarmProfile, WeatherSnapshot, FarmDoctorAdvisory, CropCalendarPlan, ChatMessage, Language } from "../types";
import { getAuthInstance } from "./firebaseClient";

// All AI calls now go through the server (/api/v1/*). The Gemini key and prompts live on the
// server only. Exported function names and return types are unchanged, so no UI code changes.

async function authHeader(): Promise<Record<string, string>> {
  try {
    const user = getAuthInstance()?.currentUser;
    if (user) return { Authorization: `Bearer ${await user.getIdToken()}` };
  } catch {
    /* anonymous use is allowed */
  }
  return {};
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* fallthrough */
  }
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error?.message || `Request failed (${res.status}).`);
  }
  return json.data as T;
}

export function analyzeCropImage(base64Image: string, cropType: CropType = "auto", cropName?: string): Promise<DiagnosisResult> {
  return post<DiagnosisResult>("diagnosis", { image: base64Image, cropType, cropName });
}

export function generateFarmDoctorAdvisory(profile: FarmProfile, weather: WeatherSnapshot | null): Promise<FarmDoctorAdvisory> {
  return post<FarmDoctorAdvisory>("advisory", { profile, weather });
}

export function generateCropCalendar(crop: string, sowingDateIso: string): Promise<CropCalendarPlan> {
  return post<CropCalendarPlan>("calendar", { crop, sowingDate: sowingDateIso });
}

export async function askFarmingQuestion(question: string, lang: Language, history: ChatMessage[]): Promise<string> {
  const { answer } = await post<{ answer: string }>("assistant", {
    question,
    lang,
    history: history.slice(-6).map((m) => ({ role: m.role, text: m.text })),
  });
  return answer;
}
