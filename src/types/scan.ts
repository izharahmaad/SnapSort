export type DisposalCategory =
  | "recycle"
  | "reuse"
  | "donate"
  | "sell"
  | "trash"
  | "hazardous"
  | "unknown";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface AnalysisResult {
  itemName: string;
  category: DisposalCategory;
  confidence: ConfidenceLevel;
  ecoScore: number;
  disposalAdvice: string;
  reuseIdea: string;
  warning: string;
}

export interface SavedScan extends AnalysisResult {
  id: string;
  userId: string;
  imageUri?: string;
  createdAt: string;
}