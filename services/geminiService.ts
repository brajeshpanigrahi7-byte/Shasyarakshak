import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiagnosisResult, CropType, FarmProfile, WeatherSnapshot, FarmDoctorAdvisory, CropCalendarPlan, ChatMessage, Language } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const diagnosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnosisName: {
      type: Type.STRING,
      description: "The common English name of the disease or pest. If healthy, say 'Healthy Crop'.",
    },
    diagnosisNameOdia: {
      type: Type.STRING,
      description: "The Odia translation of the disease name.",
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100.",
    },
    severity: {
      type: Type.STRING,
      enum: ["Low", "Medium", "High"],
      description: "The severity of the infestation or disease.",
    },
    description: {
      type: Type.STRING,
      description: "A brief explanation of the condition in English.",
    },
    descriptionOdia: {
      type: Type.STRING,
      description: "A brief explanation of the condition in Odia.",
    },
    organicControls: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of organic control measures in English.",
    },
    organicControlsOdia: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of organic control measures translated to Odia.",
    },
    chemicalControls: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of chemical control measures in English.",
    },
    chemicalControlsOdia: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of chemical control measures translated to Odia.",
    },
    isHealthy: {
      type: Type.BOOLEAN,
      description: "True if the plant is healthy, false otherwise.",
    },
  },
  required: [
    "diagnosisName",
    "diagnosisNameOdia",
    "confidenceScore",
    "severity",
    "description",
    "descriptionOdia",
    "organicControls",
    "organicControlsOdia",
    "chemicalControls",
    "chemicalControlsOdia",
    "isHealthy",
  ],
};

export async function analyzeCropImage(
  base64Image: string,
  cropType: CropType = 'auto',
  cropName?: string
): Promise<DiagnosisResult> {
  const model = "gemini-3.6-flash"; // Current GA stable Flash model (multimodal) as of Aug 2026 — update if Google retires it

  const cropHint =
    cropType === 'paddy'
      ? 'The farmer has indicated this is a Paddy (Rice) crop — prioritize rice-specific diseases and pests (e.g., Rice Blast, Brown Plant Hopper, Sheath Blight, Bacterial Leaf Blight) unless the image clearly shows otherwise.'
      : cropType === 'millet'
      ? 'The farmer has indicated this is a Millet crop (Ragi/Finger Millet, Bajra/Pearl Millet, etc.) — prioritize millet-specific diseases and pests (e.g., Ragi Blast, Downy Mildew, Stem Borer) unless the image clearly shows otherwise.'
      : cropType === 'vegetable'
      ? `The farmer has indicated this is a vegetable crop${cropName ? ` (${cropName})` : ''} — identify common vegetable diseases and pests for this crop (e.g., for tomato: Early/Late Blight, Leaf Curl Virus; for brinjal: Fruit and Shoot Borer; for onion: Purple Blotch) unless the image clearly shows otherwise.`
      : 'The crop type was not specified — first identify the crop (Paddy, Millet, vegetable, or other) before diagnosing.';

  const prompt = `
    You are an expert agricultural plant pathologist specializing in crops grown in Odisha, India — Paddy (Rice), Millets (Ragi, Bajra, etc.), and common vegetable crops (tomato, brinjal, onion, chilli, okra, etc.).

    ${cropHint}
    
    Analyze the provided image of a crop leaf or plant part.
    1. Identify if there is any disease or pest (e.g., Rice Blast, Brown Plant Hopper, Sheath Blight, Ragi Blast, Stem Borer).
    2. Determine the severity.
    3. Provide actionable organic and chemical treatment advice relevant to Indian farmers.
    4. Provide ALL text in both English and Odia language as requested in the JSON schema.
    
    If the image is not a plant or crop, indicate low confidence and state it is not recognized in the description.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
        temperature: 0.4, // Lower temperature for more deterministic/factual medical/agri advice
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text) as DiagnosisResult;
      return result;
    } else {
      throw new Error("No analysis result returned from AI.");
    }
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// AI Farm Doctor — personalized, proactive risk advisory combining the
// farmer's profile (crop age, soil, history) with the current weather.
// ---------------------------------------------------------------------------
const advisorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: "One-sentence proactive alert in English, e.g. 'High chance of Blast disease this week.'" },
    headlineOdia: { type: Type.STRING, description: "Odia translation of the headline." },
    riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    reasoning: { type: Type.STRING, description: "2-3 sentences explaining WHY, referencing crop age, weather, and soil, in English." },
    reasoningOdia: { type: Type.STRING, description: "Odia translation of the reasoning." },
    recommendedAction: { type: Type.STRING, description: "One concrete, specific action the farmer should take, with timing, in English." },
    recommendedActionOdia: { type: Type.STRING, description: "Odia translation of the recommended action." },
  },
  required: ["headline", "headlineOdia", "riskLevel", "reasoning", "reasoningOdia", "recommendedAction", "recommendedActionOdia"],
};

export async function generateFarmDoctorAdvisory(
  profile: FarmProfile,
  weather: WeatherSnapshot | null
): Promise<FarmDoctorAdvisory> {
  const sowing = new Date(profile.sowingDate);
  const ageDays = Math.max(0, Math.round((Date.now() - sowing.getTime()) / (1000 * 60 * 60 * 24)));

  const weatherLine = weather
    ? `Current weather: ${weather.temperatureC}°C, ${weather.humidity}% humidity, ${weather.rainChancePercent}% chance of rain in the next few hours, wind ${weather.windKph} km/h, condition: ${weather.condition}.`
    : "Weather data is not available right now — reason using typical seasonal conditions for Odisha instead.";

  const prompt = `
    You are an expert agronomist advising a smallholder farmer in Odisha, India. Be proactive, not just reactive.

    Farm profile:
    - District: ${profile.district || "Not specified"}
    - Crop: ${profile.cropType}
    - Crop age: ${ageDays} days since sowing (sown on ${profile.sowingDate})
    - Soil type: ${profile.soilType}
    - Past disease/pest history: ${profile.pastIssues.length ? profile.pastIssues.join(", ") : "None reported"}

    ${weatherLine}

    Based on the crop's growth stage at ${ageDays} days, the soil type, past issues, and the weather, identify the SINGLE most important risk this farmer should act on this week (e.g. disease outbreak risk due to humidity, nutrient deficiency at this growth stage, irrigation timing, pest pressure). Give one clear, specific, dated recommendation.
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: advisorySchema,
      temperature: 0.5,
    },
  });

  if (!response.text) throw new Error("No advisory returned from AI.");
  const parsed = JSON.parse(response.text) as Omit<FarmDoctorAdvisory, "generatedAt">;
  return { ...parsed, generatedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// AI Crop Calendar — generates a fertilizer/irrigation/pest/harvest timeline
// from a crop name and sowing date.
// ---------------------------------------------------------------------------
const calendarSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    harvestEstimateDayOffset: { type: Type.NUMBER, description: "Typical number of days from sowing to harvest for this crop." },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayOffset: { type: Type.NUMBER, description: "Days after sowing this task should happen." },
          category: { type: Type.STRING, enum: ["fertilizer", "irrigation", "pest", "harvest", "other"] },
          title: { type: Type.STRING, description: "Short task title in English." },
          titleOdia: { type: Type.STRING, description: "Odia translation of the title." },
          detail: { type: Type.STRING, description: "One sentence of specific guidance in English." },
          detailOdia: { type: Type.STRING, description: "Odia translation of the detail." },
        },
        required: ["dayOffset", "category", "title", "titleOdia", "detail", "detailOdia"],
      },
      description: "8-14 chronological tasks spanning the full crop cycle, covering fertilizer application, irrigation, pest/disease watch windows, and harvest.",
    },
  },
  required: ["harvestEstimateDayOffset", "tasks"],
};

export async function generateCropCalendar(crop: string, sowingDateIso: string): Promise<CropCalendarPlan> {
  const prompt = `
    You are an agricultural extension expert for Odisha, India.
    Create a practical crop calendar for growing "${crop}", sown on ${sowingDateIso}.
    Include fertilizer application windows, irrigation reminders, pest/disease watch periods (when risk is typically highest), and the harvest window.
    Base every dayOffset on standard agronomic practice for this crop in Eastern India.
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: calendarSchema,
      temperature: 0.3,
    },
  });

  if (!response.text) throw new Error("No calendar returned from AI.");
  const parsed = JSON.parse(response.text) as {
    harvestEstimateDayOffset: number;
    tasks: Array<{ dayOffset: number; category: string; title: string; titleOdia: string; detail: string; detailOdia: string }>;
  };

  const sowing = new Date(sowingDateIso);
  const addDays = (days: number) => {
    const d = new Date(sowing);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  return {
    crop,
    sowingDate: sowingDateIso,
    harvestEstimateDate: addDays(parsed.harvestEstimateDayOffset),
    generatedAt: Date.now(),
    tasks: parsed.tasks
      .sort((a, b) => a.dayOffset - b.dayOffset)
      .map((t, idx) => ({
        id: `task-${idx}`,
        dayOffset: t.dayOffset,
        date: addDays(t.dayOffset),
        category: (t.category as CropCalendarTaskCategory) || "other",
        title: t.title,
        titleOdia: t.titleOdia,
        detail: t.detail,
        detailOdia: t.detailOdia,
      })),
  };
}
type CropCalendarTaskCategory = 'fertilizer' | 'irrigation' | 'pest' | 'harvest' | 'other';

// ---------------------------------------------------------------------------
// AI Voice/Chat Assistant — free-form farming Q&A, answered in the farmer's
// chosen language, kept concise since it will often be read aloud via TTS.
// ---------------------------------------------------------------------------
export async function askFarmingQuestion(
  question: string,
  lang: Language,
  history: ChatMessage[]
): Promise<string> {
  const langName = lang === Language.ODIA ? "Odia" : "English";
  const priorTurns = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Farmer" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = `
    You are a friendly, expert agricultural assistant for farmers in Odisha, India, specializing in Paddy and Millet but able to help with any crop, livestock, or general farming question.
    Answer in ${langName} only. Keep the answer short (3-5 sentences), practical, and easy to understand for someone who may not read well — this may be read aloud to them.

    ${priorTurns ? `Recent conversation:\n${priorTurns}\n` : ""}
    Farmer's question: ${question}
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: { temperature: 0.6 },
  });

  return response.text?.trim() || (lang === Language.ODIA ? "କ୍ଷମା କରନ୍ତୁ, ଉତ୍ତର ମିଳିଲା ନାହିଁ।" : "Sorry, I couldn't generate an answer.");
}
