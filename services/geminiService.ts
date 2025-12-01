import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiagnosisResult } from "../types";

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

export async function analyzeCropImage(base64Image: string): Promise<DiagnosisResult> {
  const model = "gemini-2.5-flash"; // Using standard flash for VQA/Analysis

  const prompt = `
    You are an expert agricultural plant pathologist specializing in crops grown in Odisha, India, specifically Paddy (Rice) and Millets (Ragi, Bajra, etc.).
    
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
