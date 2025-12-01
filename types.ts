export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  isLikelyAI: boolean;
  confidenceScore: number;
  verdictTitle: string;
  reasoning: string;
  flaws?: string[];
  remediationPrompt?: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}