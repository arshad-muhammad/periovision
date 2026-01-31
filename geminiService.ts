
import { GoogleGenAI } from "@google/genai";
import { AnalysisOutput, ClinicalData } from "./types";

const SYSTEM_INSTRUCTION = `
You are an advanced medical and dental imaging annotation AI.
Your role is to perform a systematic analysis of radiographic scans.

Follow these steps for every analysis:

Step 1: Identify Image Type & Region
- Determine if Dental (IOPA, OPG, CBCT), MRI, CT, or X-ray. Identify anatomical region.

Step 2: Visual Detection & Spatial Marking
- Detect abnormalities: Caries, bone loss, periapical lesions, fractures, tumors, edema, disc herniation, etc.
- For each finding, provide normalized coordinates [ymin, xmin, ymax, xmax] in the range of 0 to 1000.

Step 3: Severity Coding
- Normal/Mild (Green)
- Moderate (Yellow)
- Severe/Critical (Red)

Step 4: JSON Output Requirement
Return a JSON object with the following structure:
{
  "imagingType": "String (e.g., OPG Dental Scan)",
  "findings": [
    {
      "label": "Short Clinical Label",
      "description": "Brief description",
      "severity": "Normal | Mild | Moderate | Severe | Critical",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ],
  "measurements": ["Specific metric 1", "Specific metric 2"],
  "diagnosis": "Primary clinical diagnosis",
  "riskLevel": "Low | Medium | High",
  "prognosis": "Good | Fair | Guarded | Poor",
  "recommendations": ["Action 1", "Action 2"],
  "limitations": ["Observation quality issues if any"],
  "disclaimer": "Standard medical disclaimer"
}

Note: Accuracy in box_2d coordinates is critical for visual marking.
`;

async function fetchWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.status === 429 || err.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function analyzeImaging(imageBase64: string, mimeType: string, clinicalData?: ClinicalData): Promise<AnalysisOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Perform Step 1-6 analysis on this scan. 
  ${clinicalData ? `Patient: ${clinicalData.patientName}, BoP: ${clinicalData.bop}%, Smoking: ${clinicalData.smokingStatus}, Diabetic: ${clinicalData.diabetic}.` : ''}
  Ensure all detected pathologies have precise 'box_2d' coordinates.`;

  return await fetchWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis received from AI.");
    return JSON.parse(text) as AnalysisOutput;
  });
}
