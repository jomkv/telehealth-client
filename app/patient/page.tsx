"use client";

import Link from "next/link";
import { PageHeader } from "@/components/nav/page-header";
import { StatCard } from "@/components/cards/stat-card";
import { ConsultationCard } from "@/components/cards/consultation-card";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Search, Sparkles, Stethoscope } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useUserStore } from "../store";
import { consultationApi } from "@/lib/api/consultation.api";
import {
  filterUpcomingConsultations,
  getConsultationCounts,
} from "@/lib/helpers/consultation-counts";

function ActionCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-full bg-card px-5 py-4 transition hover:bg-foreground hover:text-background"
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-background text-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs opacity-70">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function PatientHome() {
  const user = useUserStore((s) => s.user);

  const { data: consults = [], isLoading } = useQuery({
    queryKey: ["consultations", "me"],
    queryFn: consultationApi.getMyConsultations,
  });

  const upcoming = filterUpcomingConsultations(consults);
  const next = upcoming[0];

  const { completedCount } = getConsultationCounts(consults);

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={`Welcome back, ${user?.name.split(" ")[0] || "Patient"}`}
        title="Your health, on your time."
        description="Pick up where you left off, or start something new."
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={isLoading ? "—" : upcoming.length}
          hint="consultations scheduled"
        />
        <StatCard
          label="Completed"
          value={isLoading ? "—" : completedCount || "—"}
          hint="lifetime visits"
        />
        <StatCard
          label="Records"
          value={isLoading ? "—" : (user?.patient?.conditions.length ?? 0)}
          hint="tracked conditions"
        />
      </section>

      {/* Next visit + Quick actions */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Eyebrow>Next visit</Eyebrow>
          {isLoading ? (
            <div className="rounded-[2rem] bg-card p-8 animate-pulse h-32" />
          ) : next ? (
            <ConsultationCard consultation={next} viewerRole="PATIENT" />
          ) : (
            <div className="rounded-[2rem] bg-card p-8 text-muted-foreground">
              No upcoming consultations.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Eyebrow>Quick actions</Eyebrow>
          <ActionCard
            href="/patient/doctors"
            icon={<Search className="h-5 w-5" />}
            title="Browse doctors"
            subtitle="By specialization"
          />
          <ActionCard
            href="/patient/doctors"
            icon={<Sparkles className="h-5 w-5" />}
            title="AI symptom match"
            subtitle="Describe what you feel"
          />
          <ActionCard
            href="/patient/records"
            icon={<Stethoscope className="h-5 w-5" />}
            title="Medical records"
            subtitle="History & notes"
          />
        </div>
      </section>

      {/* Rest of upcoming */}
      {!isLoading && upcoming.length > 1 && (
        <section className="space-y-4">
          <Eyebrow>Also coming up</Eyebrow>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.slice(1).map((c) => (
              <ConsultationCard
                key={c.id}
                consultation={c}
                viewerRole="PATIENT"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
