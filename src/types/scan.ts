export const disposalCategories = [
  "recycle",
  "compost",
  "trash",
  "reuse",
  "hazardous",
] as const;

export type DisposalCategory =
  (typeof disposalCategories)[number];

export type ConfidenceLevel =
  | "low"
  | "medium"
  | "high";

export type AnalysisResult = {
  itemName: string;
  category: DisposalCategory;
  confidence: ConfidenceLevel;
  ecoScore: number;
  disposalAdvice: string;
  reuseIdea?: string;
  warning?: string;
};

export type ScanRecord = AnalysisResult & {
  id: string;
  userId: string;
  imageUri?: string | null;
  createdAt?: unknown;
};