
export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type ModalityType = 'Dental' | 'MRI' | 'CT/X-Ray';

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
  modality: ModalityType;
  patientName: string;
  patientId: string;
  // Dental specific
  bop?: number;
  pocketDepths?: string;
  smokingStatus: 'Never' | 'Former' | 'Current';
  diabetic: boolean;
  // MRI specific
  complaint?: string;
  location?: string;
  hasImplants?: boolean;
  // CT/X-Ray specific
  indication?: string;
  contrastUsed?: boolean;
  previousSurgery?: boolean;
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
  // High-precision parameters specific to the modality
  technicalParameters: Record<string, string>;
}

export interface ImagingFile {
  file: File;
  preview: string;
}
