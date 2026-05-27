"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { Role } from "@/@types/user";
import { useUserStore } from "@/app/store";

type RoleRouteGuardProps = {
  allowedRole: Role;
  children: ReactNode;
};

export function RoleRouteGuard({ allowedRole, children }: RoleRouteGuardProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);

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

    if (user.role !== allowedRole) {
      router.replace(user.role === "DOCTOR" ? "/doctor" : "/patient");
    }
  }, [allowedRole, hydrated, router, user]);

  if (!hydrated) {
    return null;
  }

  if (!user || !user.isOnboarded || user.role !== allowedRole) {
    return null;
  }

  return children;
}
