"use client";

import { PageHeader } from "@/components/nav/page-header";
import { useUserStore } from "../store";
import PatientProfile from "./components/profiles/patient-profile";
import DoctorProfile from "./components/profiles/doctor-profile";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage how you appear on Telecare and keep your details current."
      />
      {user?.role === "PATIENT" ? <PatientProfile /> : <DoctorProfile />}
      <div className="rounded-[1.5rem] bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="text-foreground font-medium">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}
