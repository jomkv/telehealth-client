"use client";

import { useUserStore } from "./store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.isOnboarded) {
      router.replace("/onboarding");
      return;
    }

    router.replace(user.role === "DOCTOR" ? "/doctor" : "/patient");
  }, [hydrated, user, router]);

  return null;
}
