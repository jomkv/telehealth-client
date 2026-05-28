"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatHour, initials } from "@/lib/helpers/format";
import {
  buildBookedSlotRange,
  buildSchedule,
  buildScheduledAtFromDateSlot,
  buildUpcomingDateOptions,
  dayKeyFromDate,
  isSameDay,
  slotToUtcIso,
} from "@/lib/helpers/availability-slots";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";
import { consultationApi } from "@/lib/api/consultation.api";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { BookingDialog } from "./components/booking-dialog";
import { PHT_TZ } from "@/lib/constants";

type SelectedSlot = {
  time: string;
} | null;

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

  const schedule = useMemo(
    () => (doctor ? buildSchedule(doctor.availability) : []),
    [doctor],
  );

  const scheduleByDay = useMemo(
    () => new Map(schedule.map(({ day, slots }) => [day, slots])),
    [schedule],
  );

  const dateOptions = useMemo(
    () => buildUpcomingDateOptions(schedule, 21),
    [schedule],
  );

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (dateOptions.length === 0) {
      setSelectedDate(null);
      return;
    }

    const stillValid =
      selectedDate &&
      dateOptions.some((option) => isSameDay(option.date, selectedDate));

    if (!stillValid) {
      setSelectedDate(dateOptions[0].date);
      setSelectedSlot(null);
    }
  }, [dateOptions, selectedDate]);

  // Fetch booked slots for the full horizon and exclude them from visible slots.
  useEffect(() => {
    if (!doctor || dateOptions.length === 0) return;

    const { from, to } = buildBookedSlotRange(dateOptions);

    let mounted = true;
    (async () => {
      try {
        const full = await doctorApi.getDoctor(doctor.id, from, to);
        if (!mounted) return;
        setBookedSlots(full.bookedSlots ?? []);
        try {
          queryClient.setQueryData(["doctor", doctor.id], full);
        } catch {}
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [doctor, dateOptions]);

  const selectedDay = selectedDate ? dayKeyFromDate(selectedDate) : null;
  const selectedSlots = selectedDay
    ? (scheduleByDay.get(selectedDay) ?? [])
    : [];

  const visibleSlots = useMemo(() => {
    if (!selectedDate) return [];

    const now = new Date();
    const candidates = isSameDay(selectedDate, now)
      ? selectedSlots.filter((time) => {
          const [hours] = time.split(":").map(Number);
          const slotDate = new Date(selectedDate);
          slotDate.setHours(hours, 0, 0, 0);
          return slotDate > now;
        })
      : selectedSlots;

    if (bookedSlots.length === 0) return candidates;

    const bookedSet = new Set(bookedSlots);
    return candidates.filter((time) => {
      const [hours] = time.split(":").map(Number);
      return !bookedSet.has(slotToUtcIso(selectedDate, hours));
    });
  }, [selectedDate, selectedSlots, bookedSlots]);

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

  function handleSlotClick(time: string) {
    if (!selectedDate) return;
    setSelectedSlot({ time });
    setOpen(true);
  }

  function handleBook(patientNotes: string) {
    if (!doctor || !selectedSlot || !selectedDate) return;

    createConsultation.mutate({
      patientNotes,
      scheduledAt: buildScheduledAtFromDateSlot(
        selectedDate,
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
        <Avatar className="h-32 w-32 ring-1 ring-border">
          <AvatarFallback className="bg-muted text-2xl">
            {initials(doctor.user.name)}
          </AvatarFallback>
        </Avatar>
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
      <section>
        <PageHeader
          eyebrow="Book a slot"
          title="Available times"
          description="Pick a date first, then select a 1-hour slot. You'll confirm with a short note about your concern."
        />

        {dateOptions.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No availability published right now.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Choose a date
              </p>
              <div className="flex flex-wrap gap-2">
                {dateOptions.map((option) => {
                  const isSelected =
                    selectedDate && isSameDay(option.date, selectedDate);

                  return (
                    <button
                      key={option.date.toISOString()}
                      onClick={() => setSelectedDate(option.date)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:bg-foreground hover:text-background"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {new Intl.DateTimeFormat("en-US", {
                        timeZone: PHT_TZ,
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }).format(option.date)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Available times
              </p>
              {selectedDate && visibleSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No remaining slots for this date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {visibleSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSlotClick(time)}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:bg-foreground hover:text-background"
                    >
                      {formatHour(time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

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
        selectedSlot={
          selectedSlot && selectedDate
            ? {
                label: new Intl.DateTimeFormat("en-US", {
                  timeZone: PHT_TZ,
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(selectedDate),
                time: selectedSlot.time,
              }
            : null
        }
        isPending={createConsultation.isPending}
        onConfirm={handleBook}
      />
    </div>
  );
}
