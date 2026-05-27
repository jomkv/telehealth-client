import { MeUser } from "@/@types/user";
import { create } from "zustand";

interface UserStore {
  user: MeUser | null;
  hydrated: boolean;
  setUser: (user: MeUser | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user, hydrated: true }),
  reset: () => set({ user: null, hydrated: false }), // For logout
}));
