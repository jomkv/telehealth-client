"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { StatusPill } from "@/components/ui-bits/status-pill";
import { friendlyDay, formatDateTime, initials } from "@/lib/helpers/format";
import { CalendarClock, RefreshCw, Video, XCircle, X } from "lucide-react";
import { consultationApi } from "@/lib/api/consultation.api";
import { doctorApi } from "@/lib/api/doctor.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildScheduledAtFromDateSlot } from "@/lib/helpers/availability-slots";
import { RescheduleDialog } from "./components/reschedule-dialog";
import BookingScheduleSelector from "../../../../components/selectors/booking-schedule-selector";
import { SelectedSlot } from "@/@types/consultation";

export default function ConsultationDetailPage() {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: c, isLoading: isConsultationLoading } = useQuery({
    queryKey: ["consultation", id],
    queryFn: () => consultationApi.getConsultation(id),
    enabled: !!id,
  });

  const { data: doctor } = useQuery({
    queryKey: ["doctor", c?.doctor.id],
    queryFn: () => doctorApi.getDoctor(c!.doctor.id),
    enabled: isRescheduling && !!c?.doctor.id, // only fires when resched opened
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

  const rescheduleMutation = useMutation({
    mutationFn: (scheduledAt: string) =>
      consultationApi.rescheduleConsultation(id, scheduledAt),
    onSuccess: () => {
      toast.success("Consultation rescheduled.");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      setDialogOpen(false);
      setSelectedSlot(null);
      setIsRescheduling(false);
    },
    onError: () => toast.error("Failed to reschedule. Please try again."),
  });

  function handleInitiateBooking(date: Date, time: string) {
    setSelectedSlot({
      date: date,
      time: time,
    });
    setDialogOpen(true);
  }

  function handleConfirm() {
    if (!doctor || !selectedSlot) return;
    rescheduleMutation.mutate(
      buildScheduledAtFromDateSlot(selectedSlot.date, selectedSlot.time),
    );
  }

  function handleDismissReschedule() {
    setIsRescheduling(false);
    setSelectedSlot(null);
  }

  if (isConsultationLoading) {
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
              <Button
                variant={isRescheduling ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  isRescheduling
                    ? handleDismissReschedule()
                    : setIsRescheduling(true)
                }
              >
                {isRescheduling ? (
                  <>
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel reschedule
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Reschedule
                  </>
                )}
              </Button>

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

      {/* Inline reschedule picker */}
      {doctor && isRescheduling && (
        <BookingScheduleSelector
          doctor={doctor}
          handleInitiateBooking={handleInitiateBooking}
          label={"Reschedule your appointment"}
        />
      )}

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

      {/* Reschedule confirmation dialog */}
      <RescheduleDialog
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) setSelectedSlot(null);
        }}
        doctorName={c.doctor.user.name}
        selectedSlot={selectedSlot}
        isPending={rescheduleMutation.isPending}
        onConfirm={handleConfirm}
      />
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
