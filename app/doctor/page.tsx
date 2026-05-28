"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/nav/page-header";
import { StatCard } from "@/components/cards/stat-card";
import { ConsultationCard } from "@/components/cards/consultation-card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store";
import { consultationApi } from "@/lib/api/consultation.api";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import {
  filterPastConsultations,
  getConsultationCounts,
} from "@/lib/helpers/consultation-counts";

export default function DoctorHomePage() {
  const user = useUserStore((s) => s.user);
  const { data: consults = [] } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.doctor?.id,
  });

  const { todayCount, upcomingCount, completedCount } =
    getConsultationCounts(consults);
  const upcoming = filterPastConsultations(consults);

  const next = upcoming[0];

  const firstName = user?.name.split(" ")[0] || "Doctor";

  return (
    <div className="space-y-12">
      {/* Header */}
      <PageHeader
        eyebrow={`Good day, ${firstName}`}
        title="Your schedule today."
        description={`${todayCount.length} consultation${todayCount.length === 1 ? "" : "s"} on the books for today.`}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/doctor/availability">Manage availability</Link>
          </Button>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today"
          value={todayCount.length}
          hint="consultations"
        />
        <StatCard
          label="Upcoming"
          value={upcomingCount.length}
          hint="this period"
        />
        <StatCard label="Completed" value={completedCount} hint="lifetime" />
      </section>

      {/* Next up */}
      {next && (
        <section className="space-y-4">
          <Eyebrow>Next on your schedule</Eyebrow>
          <ConsultationCard consultation={next} viewerRole="DOCTOR" />
        </section>
      )}

      {/* Today's timeline */}
      <section className="space-y-4">
        <Eyebrow>Today&rsquo;s timeline</Eyebrow>
        {todayCount.length === 0 ? (
          <div className="rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
            Nothing scheduled for today. Enjoy the breathing room.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todayCount.map((c) => (
              <ConsultationCard
                key={c.id}
                consultation={c}
                viewerRole="DOCTOR"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
