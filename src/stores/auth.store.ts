import { create } from "zustand";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthState {
  user: AppUser | null;
  ready: boolean;
  setUser: (user: AppUser | null) => void;
  setReady: (ready: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,

  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
  clearUser: () => set({ user: null }),
}));