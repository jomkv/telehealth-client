"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/nav/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultationCard } from "@/components/cards/consultation-card";
import { consultationApi } from "@/lib/api/consultation.api";
import { useUserStore } from "@/app/store";
import {
  filterCancelledConsultations,
  filterPastConsultations,
  filterUpcomingConsultations,
} from "@/lib/helpers/consultation-counts";
import Empty from "@/components/ui-bits/empty";

export default function DoctorConsultationsPage() {
  const user = useUserStore((s) => s.user);

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.doctor?.id,
  });

  const upcoming = filterUpcomingConsultations(all);
  const past = filterPastConsultations(all);
  const cancelled = filterCancelledConsultations(all);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Patient visits"
        title="Your consultations"
        description="Manage every patient session."
      />

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="rounded-full bg-card p-1">
          <TabsTrigger
            value="upcoming"
            className="rounded-full"
            disabled={isLoading}
          >
            Upcoming · {upcoming.length}
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-full"
            disabled={isLoading}
          >
            Past · {past.length}
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-full"
            disabled={isLoading}
          >
            Cancelled · {cancelled.length}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="grid gap-4 md:grid-cols-2">
          {isLoading && <Empty label="Loading consultations..." />}
          {!isLoading && upcoming.length === 0 && (
            <Empty label="Nothing upcoming." />
          )}
          {upcoming.map((c) => (
            <ConsultationCard key={c.id} consultation={c} viewerRole="DOCTOR" />
          ))}
        </TabsContent>

        <TabsContent value="past" className="grid gap-4 md:grid-cols-2">
          {past.length === 0 && <Empty label="No past consultations yet." />}
          {past.map((c) => (
            <ConsultationCard key={c.id} consultation={c} viewerRole="DOCTOR" />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="grid gap-4 md:grid-cols-2">
          {cancelled.length === 0 && <Empty label="Nothing cancelled." />}
          {cancelled.map((c) => (
            <ConsultationCard key={c.id} consultation={c} viewerRole="DOCTOR" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
