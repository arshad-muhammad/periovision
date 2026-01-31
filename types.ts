
export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Annotation {
  id: string;
  type: 'line' | 'point' | 'ai_box';
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  label: string;
  severity?: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
}

export interface ClinicalData {
  patientName: string;
  patientId: string;
  bop: number;
  pocketDepths: string;
  smokingStatus: 'Never' | 'Former' | 'Current';
  diabetic: boolean;
}

export interface AIFinding {
  label: string;
  description: string;
  severity: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
}

export interface AnalysisOutput {
  imagingType: string;
  findings: AIFinding[];
  measurements: string[];
  diagnosis: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  prognosis: 'Good' | 'Fair' | 'Guarded' | 'Poor';
  recommendations: string[];
  limitations: string[];
  disclaimer: string;
}

export interface ImagingFile {
  file: File;
  preview: string;
}
