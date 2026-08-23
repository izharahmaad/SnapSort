import { create } from "zustand";
import type {
  AnalysisResult,
} from "../types/scan";

export type { AnalysisResult };

type ScanState = {
  imageUri: string | null;
  imageBase64: string | null;
  imageMimeType: string;
  result: AnalysisResult | null;
  isAnalyzing: boolean;

  setImage: (
    uri: string,
    base64: string,
    mimeType?: string
  ) => void;

  setImageUri: (uri: string | null) => void;
  setImageBase64: (base64: string | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (value: boolean) => void;
  resetScan: () => void;
};

export const useScanStore = create<ScanState>((set) => ({
  imageUri: null,
  imageBase64: null,
  imageMimeType: "image/jpeg",
  result: null,
  isAnalyzing: false,

  setImage: (
    imageUri,
    imageBase64,
    imageMimeType = "image/jpeg"
  ) =>
    set({
      imageUri,
      imageBase64,
      imageMimeType,
    }),

  setImageUri: (imageUri) => set({ imageUri }),

  setImageBase64: (imageBase64) => set({ imageBase64 }),

  setResult: (result) => set({ result }),

  setIsAnalyzing: (isAnalyzing) =>
    set({ isAnalyzing }),

  resetScan: () =>
    set({
      imageUri: null,
      imageBase64: null,
      imageMimeType: "image/jpeg",
      result: null,
      isAnalyzing: false,
    }),
}));