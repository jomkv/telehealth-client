"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { StatusPill } from "@/components/ui-bits/status-pill";
import { friendlyDay, formatDateTime, initials } from "@/lib/helpers/format";
import { CalendarClock, RefreshCw, Video, XCircle } from "lucide-react";
import { consultationApi } from "@/lib/api/consultation.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: c, isLoading } = useQuery({
    queryKey: ["consultation", id],
    queryFn: () => consultationApi.getConsultation(id),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => consultationApi.cancelConsultation(id),
    onSuccess: () => {
      toast.success("Consultation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: () => toast.error("Failed to cancel. Please try again."),
  });

  const [date, setDate] = useState<Date | undefined>();

  // const reschedule = useRescheduleConsultation();
  // const cancel = useCancelConsultation();

  if (isLoading) {
    return (
      <div className="py-24 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!c) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Consultation not found.
      </div>
    );
  }

  const canManage = c.status === "PENDING";

  const handleReschedule = () => {
    // if (!date) return;
    // reschedule.mutate(
    //   { id: c.id, scheduledAt: date.toISOString() },
    //   { onSuccess: () => toast.success("Consultation rescheduled") },
    // );
  };

  return (
    <div className="space-y-10">
      <Link
        href="/patient/consultations"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All consultations
      </Link>

      {/* Hero card */}
      <section className="rounded-[2.5rem] bg-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-muted text-xl">
                {initials(c.doctor.user.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <Eyebrow>{c.doctor.specialization.label}</Eyebrow>
              <h1 className="mt-2 text-3xl">{c.doctor.user.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
                <CalendarClock className="h-4 w-4" />
                {friendlyDay(c.scheduledAt)}
              </p>
              {c.rescheduledFrom && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Rescheduled from {formatDateTime(c.rescheduledFrom)}
                </p>
              )}
            </div>
          </div>

          <StatusPill status={c.status} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(c.status === "PENDING" || c.status === "ONGOING") &&
            c.meetingLink && (
              <Button asChild className="rounded-full">
                <a href={c.meetingLink} target="_blank" rel="noreferrer">
                  <Video className="mr-1.5 h-4 w-4" />
                  Join consultation
                </a>
              </Button>
            )}

          {canManage && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Reschedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Pick a new date</DialogTitle>
                  </DialogHeader>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-2xl border"
                  />
                  <DialogFooter>
                    <Button
                      className="rounded-full"
                      onClick={handleReschedule}
                      disabled={false}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="rounded-full"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="grid gap-6 md:grid-cols-2">
        <Block title="Your notes at booking">
          <p className="text-foreground/80">{c.patientNotes || "—"}</p>
        </Block>

        <Block title="Doctor's notes">
          {c.doctorNotes ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80">
              {c.doctorNotes}
            </pre>
          ) : (
            <p className="italic text-muted-foreground">
              {c.status === "DONE"
                ? "No notes added."
                : "Available after the consultation."}
            </p>
          )}
        </Block>
      </section>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-card p-6">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-4">{children}</div>
    </div>
  );
}
