"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultationCard } from "@/components/cards/consultation-card";
import { PageHeader } from "@/components/nav/page-header";
import { useUserStore } from "@/app/store";
import { useQuery } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation.api";
import {
  filterCancelledConsultations,
  filterPastConsultations,
  filterUpcomingConsultations,
} from "@/lib/helpers/consultation-counts";

export default function ConsultationsPage() {
  const user = useUserStore((s) => s.user);

  const { data: all = [] } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.patient?.id,
  });

  const upcoming = filterUpcomingConsultations(all);
  const past = filterPastConsultations(all);
  const cancelled = filterCancelledConsultations(all);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="My visits"
        title="Consultations"
        description="Track upcoming visits and review past ones."
      />

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="rounded-full bg-card p-1">
          <TabsTrigger value="upcoming" className="rounded-full">
            Upcoming · {upcoming.length}
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-full">
            Past · {past.length}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-full">
            Cancelled · {cancelled.length}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="grid gap-4 md:grid-cols-2">
          {upcoming.length === 0 && (
            <Empty label="No upcoming consultations." />
          )}
          {upcoming.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              viewerRole="PATIENT"
            />
          ))}
        </TabsContent>

        <TabsContent value="past" className="grid gap-4 md:grid-cols-2">
          {past.length === 0 && <Empty label="No past consultations yet." />}
          {past.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              viewerRole="PATIENT"
            />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="grid gap-4 md:grid-cols-2">
          {cancelled.length === 0 && <Empty label="Nothing cancelled." />}
          {cancelled.map((c) => (
            <ConsultationCard
              key={c.id}
              consultation={c}
              viewerRole="PATIENT"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
      {label}
    </div>
  );
}
