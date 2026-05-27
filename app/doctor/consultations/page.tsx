"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/nav/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultationCard } from "@/components/cards/consultation-card";
import { consultationApi } from "@/lib/api/consultation.api";
import { useUserStore } from "@/app/store";

function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
      {label}
    </div>
  );
}

export default function DoctorConsultationsPage() {
  const user = useUserStore((s) => s.user);

  const { data: all = [] } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: () => consultationApi.getDoctorConsultations(),
    enabled: !!user?.doctor?.id,
  });

  const upcoming = all
    .filter((c) => c.status === "PENDING" || c.status === "ONGOING")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const past = all
    .filter((c) => c.status === "DONE")
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const cancelled = all.filter((c) => c.status === "CANCELLED");

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Patient visits"
        title="Your consultations"
        description="Manage every patient session."
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
          {upcoming.length === 0 && <Empty label="Nothing upcoming." />}
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
