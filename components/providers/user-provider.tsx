"use client";

import { useEffect } from "react";
import { useUserStore } from "@/app/store";
import { User } from "@/@types/user";

export function UserProvider({ user }: { user: User | null }) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user]);

  return null;
}
