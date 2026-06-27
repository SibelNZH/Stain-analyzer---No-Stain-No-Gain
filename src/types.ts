export interface DiagnosisResult {
  stainName: string;
  confidence: number;
  fabricType: string;
  absorbency: string;
  precaution: string;
  steps: {
    title: string;
    description: string;
  }[];
  communityWisdom: {
    source: string;
    text: string;
    subtext: string;
  }[];
}

export interface HistoryItem {
  id: string;
  stainName: string;
  date: string;
  fabricType: string;
  garmentType: string;
  status: 'Success' | 'Pending';
  imageUrl: string;
  diagnosis: DiagnosisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  estimatedTime?: string;
  imageUrl?: string;
}
