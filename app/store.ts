import { MeUser } from "@/@types/user";
import { create } from "zustand";

interface UserStore {
  user: MeUser | null;
  setUser: (user: MeUser | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
