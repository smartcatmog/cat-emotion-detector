export type EmotionType = 'happy' | 'content' | 'playful' | 'curious' | 'anxious' | 'stressed' | 'angry' | 'sleepy' | 'hungry' | 'neutral';

export interface Emotion {
  type: EmotionType;
  confidence: number;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalysisResult {
  id: string;
  galleryId?: string;  // cat_images table row id, if saved to gallery
  fileType: 'image' | 'video';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  emotions?: Emotion[];
  emotionsTimeline?: Array<{
    timestamp: number;
    emotions: Emotion[];
  }>;
  summary?: {
    dominantEmotion: EmotionType;
    averageConfidence: number;
    emotionDistribution: Record<EmotionType, number>;
  };
  interpretation: string;
  recommendations: string[];
  thumbnailUrl: string;
  originalFileUrl: string;
  duration?: number;
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export interface AnalysisState {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface HistoryState {
  items: AnalysisResult[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
