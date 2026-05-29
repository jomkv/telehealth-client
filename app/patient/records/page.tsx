"use client";

import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { PageHeader } from "@/components/nav/page-header";
import { formatDate } from "@/lib/helpers/format";
import { useUserStore } from "@/app/store";
import ProfileHealth from "./components/profile-health";
import { filterPastConsultations } from "@/lib/helpers/consultation-counts";
import { useQuery } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation.api";

export default function RecordsPage() {
  const user = useUserStore((s) => s.user);

  const { data: all = [] } = useQuery({
    queryKey: ["consultations", "patient", user?.patient?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.patient?.id,
  });

  const past = filterPastConsultations(all);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your health"
        title="Medical records"
        description="Your profile-level health info plus history from completed consultations."
      />

      {user && user.patient && <ProfileHealth patient={user.patient} />}

      <section className="space-y-4">
        <Eyebrow>Consultation history</Eyebrow>

        {past.length === 0 && (
          <div className="rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
            No completed consultations yet.
          </div>
        )}

        <div className="space-y-4">
          {past.map((c) => (
            <div key={c.id} className="rounded-[2rem] bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.doctor.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.doctor.specialization.label} ·{" "}
                    {formatDate(c.scheduledAt)}
                  </p>
                </div>
              </div>
              {c.doctorNotes && (
                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-background p-4 font-sans text-sm text-foreground/80">
                  {c.doctorNotes}
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
