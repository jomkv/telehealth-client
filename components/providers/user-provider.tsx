"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/store";
import { MeUser } from "@/@types/user";

export function UserProvider({ user }: { user: MeUser | null }) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
}
