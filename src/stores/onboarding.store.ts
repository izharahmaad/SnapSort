import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const ONBOARDING_KEY = "@snapsort_onboarding_completed";

interface OnboardingState {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  loadOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isLoading: true,
  hasCompletedOnboarding: false,

  loadOnboardingStatus: async () => {
    try {
      const savedStatus = await AsyncStorage.getItem(ONBOARDING_KEY);

      set({
        hasCompletedOnboarding: savedStatus === "true",
        isLoading: false,
      });
    } catch {
      set({
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");

    set({
      hasCompletedOnboarding: true,
    });
  },

  resetOnboarding: async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);

    set({
      hasCompletedOnboarding: false,
    });
  },
}));