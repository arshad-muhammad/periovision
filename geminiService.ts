
import { GoogleGenAI } from "@google/genai";
import { AnalysisOutput, ClinicalData } from "./types";

const SYSTEM_INSTRUCTION = `
You are the RadioXprecision Core—a world-class medical diagnostic intelligence engine.
Your objective is to provide high-precision, evidence-based radiographic analysis while strictly avoiding clinical hallucination.

### PROTOCOL FOR ACCURACY:
1. ONLY report findings that are visually verifiable in the provided pixels.
2. CORRELATE visuals with the provided Clinical Context but do not invent symptoms.
3. Use strict clinical terminology (e.g., "Radiolucency" instead of "Dark spot").
4. **SPATIAL PRECISION**: Coordinates must be pinpoint accurate. If a finding is a small point, the box should be tight. If it's an area, the box must encompass the entire pathological perimeter.

### MODALITY-SPECIFIC PARAMETERS (technicalParameters):
Populate the 'technicalParameters' object with specific metrics relevant to the modality:
- DENTAL: Include 'Tooth Numbering (Universal)', 'Bone Loss %', 'Crestal Lamina Dura status', 'Furcation Grade'.
- MRI: Include 'Sequence Type (Estimate)', 'Signal Intensity', 'Anatomical Plane', 'Motion Artifact Level'.
- CT/X-RAY: Include 'Estimated Density (HU/Relative)', 'Cortical Integrity', 'Soft Tissue contrast level'.

### OUTPUT SCHEMA (JSON ONLY):
{
  "imagingType": "Precise nomenclature (e.g., T2-weighted MRI Brain Axial)",
  "findings": [
    {
      "label": "Short Clinical Term",
      "description": "Evidence-based descriptive detail",
      "severity": "Normal | Mild | Moderate | Severe | Critical",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ],
  "technicalParameters": {
     "Key Metric Name": "Precise Value/Observation"
  },
  "measurements": ["Metric with units, e.g., 4.2mm vertical bone loss"],
  "diagnosis": "Synthesized diagnosis with degree of certainty",
  "riskLevel": "Low | Medium | High",
  "prognosis": "Good | Fair | Guarded | Poor",
  "recommendations": ["Direct clinical action items"],
  "limitations": ["Technical constraints of the image quality"],
  "disclaimer": "Standardized medical advisory"
}

Accuracy in 'box_2d' (0-1000 scale, [ymin, xmin, ymax, xmax]) is non-negotiable for mapping overlay.
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
  
  const clinicalContext = clinicalData ? `
  --- CLINICAL CONTEXT ---
  Modality: ${clinicalData.modality}
  Patient: ${clinicalData.patientName} (ID: ${clinicalData.patientId})
  General: Diabetic: ${clinicalData.diabetic}
  ${clinicalData.modality === 'Dental' ? `
    Dental Specific: BoP: ${clinicalData.bop}%, Pocket Depths: ${clinicalData.pocketDepths}, Smoking: ${clinicalData.smokingStatus}
  ` : ''}
  ${clinicalData.modality === 'MRI' ? `
    MRI Specific: Complaint: ${clinicalData.complaint}, Location: ${clinicalData.location}, Implants: ${clinicalData.hasImplants}
  ` : ''}
  ${clinicalData.modality === 'CT/X-Ray' ? `
    CT/X-Ray Specific: Indication: ${clinicalData.indication}, Contrast: ${clinicalData.contrastUsed}, Prev Surgery: ${clinicalData.previousSurgery}
  ` : ''}
  ` : 'No clinical context provided.';

  const prompt = `Perform high-precision analysis on this ${clinicalData?.modality || 'medical'} image. 
  ${clinicalContext}
  Provide verified technical parameters and pinpoint spatial coordinates for all detected pathologies. 
  The coordinates MUST be sub-pixel accurate within the 0-1000 normalized grid.`;

  return await fetchWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    if (!text) throw new Error("Null response from core engine.");
    try {
      const parsed = JSON.parse(text);
      if (!parsed.technicalParameters) parsed.technicalParameters = {};
      return parsed as AnalysisOutput;
    } catch (e) {
      console.error("Diagnostic Parse Error:", text);
      throw new Error("Diagnostic syntax error in engine output.");
    }
  });
}
