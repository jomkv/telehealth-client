"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatHour, initials } from "@/lib/helpers/format";
import { buildSchedule } from "@/lib/helpers/availability-slots";
import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "@/lib/api/doctor.api";

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

  const schedule = doctor ? buildSchedule(doctor.availability) : [];

  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    time: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  function handleSlotClick(day: string, time: string) {
    setSelectedSlot({ day, time });
    setNotes("");
    setOpen(true);
  }

  function handleBook() {
    toast.success("Consultation booked");
    setOpen(false);
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
          description="Pick a 1-hour slot. You'll confirm with a short note about your concern."
        />

        {schedule.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No availability published right now.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            {schedule.map(({ day, label, slots }) => (
              <div key={day}>
                {/* Day header */}
                <p className="mb-3 text-sm font-medium text-foreground">
                  {label}
                </p>

                {/* Timeslot pills */}
                <div className="flex flex-wrap gap-2">
                  {slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSlotClick(label, time)}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:bg-foreground hover:text-background"
                    >
                      {formatHour(time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking dialog — controlled single instance, no per-slot Dialog mount */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Book consultation</DialogTitle>
            <DialogDescription>
              {doctor.user.name}
              {selectedSlot &&
                ` · ${selectedSlot.day} at ${formatHour(selectedSlot.time)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Symptoms or concerns</label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>
          <DialogFooter>
            <Button
              className="rounded-full"
              onClick={handleBook}
              disabled={notes.trim().length < 4}
            >
              Confirm booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
