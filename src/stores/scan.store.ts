import { create } from "zustand";
import { AnalysisResult } from "../types/scan";

interface ScanState {
  imageUri: string | null;
  result: AnalysisResult | null;
  isAnalyzing: boolean;

  setImageUri: (uri: string | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  imageUri: null,
  result: null,
  isAnalyzing: false,

  setImageUri: (imageUri) => set({ imageUri }),
  setResult: (result) => set({ result }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  resetScan: () =>
    set({
      imageUri: null,
      result: null,
      isAnalyzing: false,
    }),
}));