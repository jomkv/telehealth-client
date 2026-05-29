"use client";

import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { PageHeader } from "@/components/nav/page-header";
import { formatDate } from "@/lib/helpers/format";
import { useUserStore } from "@/app/store";
import { filterPastConsultations } from "@/lib/helpers/consultation-counts";
import { useQuery } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { doctorApi } from "@/lib/api/doctor.api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const user = useUserStore((s) => s.user);
  const [specId, setSpecId] = useState<string>("");

  const { data: all = [] } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.doctor?.id,
  });

  const { data: specializations, isPending } = useQuery({
    queryKey: ["specializations"],
    queryFn: doctorApi.getSpecializations,
  });

  const past = filterPastConsultations(all);

  const firstName = user?.name.split(" ")[0] || "Doctor";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={`Nice job, ${firstName || "doctor"}`}
        title="Portfolio"
        description="Your professional credentials plus history of completed consultations."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-card p-6">
          <Eyebrow>Specialty</Eyebrow>
          <Select value={specId} onValueChange={setSpecId} disabled={isPending}>
            <SelectTrigger className="w-full mt-3">
              <SelectValue placeholder="Select a specialization" />
            </SelectTrigger>
            <SelectContent>
              {specializations?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-[2rem] bg-card p-6">
          <Eyebrow>Years of Practice</Eyebrow>
          <Input className="mt-3" type="number" min={0} />
        </div>

        <div className="rounded-[2rem] bg-card p-6 sm:col-span-2">
          <Eyebrow>Bio</Eyebrow>
          <Textarea rows={5} className="mt-3" />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <Button className="rounded-full px-8">Apply Changes</Button>
        </div>
      </section>

      <section className="space-y-4">
        <Eyebrow>Consultation history</Eyebrow>

        {past.length === 0 && (
          <div className="rounded-[2rem] bg-card p-12 text-center text-muted-foreground">
            No consultations done yet.
          </div>
        )}

        <div className="space-y-4">
          {past.map((c) => (
            <div key={c.id} className="rounded-[2rem] bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.patient.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.patient.weight}kg · {c.patient.height}cm ·{" "}
                    {formatDate(c.scheduledAt)}
                  </p>
                </div>
              </div>

              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-background p-4 font-sans text-sm text-foreground/80">
                {c.patientNotes}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
