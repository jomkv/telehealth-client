"use client";

import { AuthShell } from "@/components/shells/auth-shell";
import { DoctorForm } from "@/app/onboarding/components/doctor-form";
import { PatientForm } from "@/app/onboarding/components/patient-form";
import { useUserStore } from "../store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }

    if (user?.isOnboarded) {
      router.replace("/");
    }
  }, [user, router]);

  const title =
    user?.role === "DOCTOR" ? "Doctor onboarding" : "Patient onboarding";
  const description =
    user?.role === "DOCTOR"
      ? "Introduce your practice so patients can meet you with confidence."
      : "Share health basics so we can personalize your care plan.";

  return (
    <AuthShell title={title} description={description}>
      <div className="space-y-6">
        <div className="flex items-center justify-end text-sm text-[#555555]">
          <span>Step 1 of 1</span>
        </div>

        {user?.role === "DOCTOR" ? <DoctorForm /> : <PatientForm />}
      </div>
    </AuthShell>
  );
}
