
export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type Language = 'en' | 'zh';

export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MathResponse {
  answer: string;      // New field: Concise final answer
  explanation: string; // The markdown detailed solution
  quiz: QuizData;      // The interactive quiz object
}

// Deprecated but kept for compatibility if needed, though we primarily use MathResponse now
export interface MathSolution {
  originalImage: string;
  markdownContent: string;
}

export interface AnalyzeError {
  message: string;
}
