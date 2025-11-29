export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type Language = 'en' | 'zh';

export interface MathSolution {
  originalImage: string;
  markdownContent: string;
}

export interface AnalyzeError {
  message: string;
}