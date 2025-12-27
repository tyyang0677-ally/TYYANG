
export enum SubmissionStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  unixTime: number; // For calculations
  intent?: 'CONCEPT' | 'METHOD' | 'GENERATION';
}

export interface LearningSession {
  startTime: number;
  submitTime?: number;
  events: Array<{
    type: string;
    time: number;
    metadata?: any;
  }>;
}

export type ViewType = 'stats' | 'timeline';
