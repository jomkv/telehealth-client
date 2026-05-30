"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { toast } from "sonner";
import { buildScheduledAtFromDateSlot } from "@/lib/helpers/availability-slots";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";
import { consultationApi } from "@/lib/api/consultation.api";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { BookingDialog } from "./components/booking-dialog";
import BookingScheduleSelector from "@/components/selectors/booking-schedule-selector";
import { SelectedSlot } from "@/@types/consultation";
import { UserAvatar } from "@/components/avatars/user-avatar";

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: doctor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctorApi.getDoctor(id),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [open, setOpen] = useState(false);

  const createConsultation = useMutation({
    mutationFn: consultationApi.createConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", "me"] });
      toast.success("Consultation booked");
      setOpen(false);
      setSelectedSlot(null);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  function handleInitiateBooking(date: Date, time: string) {
    setSelectedSlot({
      date: date,
      time: time,
    });
    setOpen(true);
  }

  function handleBook(patientNotes: string) {
    if (!doctor || !selectedSlot) return;

    createConsultation.mutate({
      patientNotes,
      scheduledAt: buildScheduledAtFromDateSlot(
        selectedSlot.date,
        selectedSlot.time,
      ),
      doctorId: doctor.id,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="h-5 w-36 rounded-full bg-card animate-pulse" />
        <section className="flex flex-wrap items-start gap-8 rounded-[2.5rem] bg-card p-8">
          <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 min-w-[260px] space-y-3">
            <div className="h-4 w-28 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-64 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded-full bg-muted animate-pulse" />
          </div>
        </section>
        <section className="space-y-6">
          <div className="h-12 w-72 rounded-full bg-card animate-pulse" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`slot-skeleton-${index}`}
                className="h-12 rounded-full bg-card animate-pulse"
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Doctor not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Link
        href="/patient/doctors"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to directory
      </Link>

      {/* Doctor header card */}
      <section className="flex flex-wrap items-start gap-8 rounded-[2.5rem] bg-card p-8">
        <UserAvatar
          name={doctor.user.name}
          src={doctor.user.profilePic}
          className="h-32 w-32 ring-1 ring-border"
          fallbackClassName="bg-muted text-xl"
        />
        <div className="flex-1 min-w-[260px]">
          <Eyebrow>{doctor.specialization.label}</Eyebrow>
          <h1 className="mt-3 text-4xl">{doctor.user.name}</h1>
          {doctor.yearsOfPractice != null && (
            <p className="mt-2 text-muted-foreground">
              {doctor.yearsOfPractice} years of practice
            </p>
          )}
          {doctor.bio && (
            <p className="mt-4 max-w-2xl text-foreground/80">{doctor.bio}</p>
          )}
        </div>
      </section>

      {/* Availability + booking */}
      {doctor && (
        <BookingScheduleSelector
          doctor={doctor}
          handleInitiateBooking={handleInitiateBooking}
          label={"Schedule an appointent"}
        />
      )}

      {/* Booking dialog — controlled single instance, no per-slot Dialog mount */}
      <BookingDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSelectedSlot(null);
          }
        }}
        doctorName={doctor.user.name}
        selectedSlot={selectedSlot}
        isPending={createConsultation.isPending}
        onConfirm={handleBook}
      />
    </div>
  );
}
