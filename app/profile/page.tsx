"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { PageHeader } from "@/components/nav/page-header";
import { useUserStore } from "../store";
import { userApi } from "@/lib/api/user.api";
import { UpdateUserForm } from "./components/update-user-form";
import { MeUser, UpdateUserInput } from "@/@types/user";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const setUser = useUserStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    if (user && !user.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [user, router, hydrated]);

  // no preview state — using plain file input

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (fd: UpdateUserInput) => userApi.updateMe(fd),
    onSuccess: (user: MeUser) => {
      setUser(user);
    },
  });

  if (!hydrated) return null;
  if (!user) return null;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage how you appear on Telecare and keep your details current."
      />

      <div className="rounded-[1.5rem] bg-card p-8 space-y-8">
        {/* Fields */}
        <UpdateUserForm
          onSubmit={(fd: UpdateUserInput) => mutate(fd)}
          isLoading={isPending}
        />
      </div>

      {/* Footer strip */}
      <div className="rounded-[1.5rem] bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="text-foreground font-medium">{user.email}</span>
        </p>
      </div>
    </div>
  );
}
