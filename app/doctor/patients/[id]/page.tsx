"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { formatDate } from "@/lib/helpers/format";
import { useUserStore } from "@/app/store";
import { consultationApi } from "@/lib/api/consultation.api";
import { patientApi } from "@/lib/api/patient.api";
import { UserAvatar } from "@/components/avatars/user-avatar";
import Empty from "@/components/ui-bits/empty";

function Card({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] bg-card p-6">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">None</span>
        ) : (
          items.map((it) => (
            <span
              key={it}
              className="rounded-full bg-background px-2.5 py-0.5 text-xs"
            >
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default function PatientRecordPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const user = useUserStore((s) => s.user);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientApi.getPatient(patientId),
    enabled: !!patientId,
  });

  const { data: allConsults = [] } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.doctor?.id,
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!patient) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Patient not found.
      </div>
    );
  }

  const past = allConsults
    .filter((c) => c.patientId === patientId && c.status === "DONE")
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  return (
    <div className="space-y-10">
      <Link
        href="/doctor/consultations"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>

      {/* Profile header */}
      <section className="flex flex-wrap items-start gap-6 rounded-[2.5rem] bg-card p-8">
        <UserAvatar
          name={patient.user.name}
          src={patient.user.profilePic}
          className="h-24 w-24 ring-1 ring-border"
          fallbackClassName="bg-muted text-xl"
        />
        <div className="min-w-60 flex-1">
          <Eyebrow>Patient</Eyebrow>
          <h1 className="mt-3 text-3xl">{patient.user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            DOB {formatDate(patient.user.birthday)} ·{" "}
            {patient.user.mobileNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.weight} kg · {patient.height} cm
          </p>
        </div>
      </section>

      {/* Health tags */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card label="Conditions" items={patient.conditions} />
        <Card label="Allergies" items={patient.allergies} />
        <Card label="Medications" items={patient.medications} />
      </section>

      {/* Profile notes */}
      {patient.notes && (
        <section className="rounded-[2rem] bg-card p-6">
          <Eyebrow>Profile notes</Eyebrow>
          <p className="mt-3 text-sm text-foreground/80">{patient.notes}</p>
        </section>
      )}

      {/* Consultation history */}
      <section className="space-y-4">
        <Eyebrow>Your consultation history with this patient</Eyebrow>
        {past.length === 0 ? (
          <Empty label="No completed consultations with this patient yet." />
        ) : (
          past.map((c) => (
            <div key={c.id} className="rounded-[2rem] bg-card p-6">
              <p className="text-sm text-muted-foreground">
                {formatDate(c.scheduledAt)}
              </p>
              {c.doctorNotes && (
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-background p-4 font-sans text-sm text-foreground/80">
                  {c.doctorNotes}
                </pre>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
