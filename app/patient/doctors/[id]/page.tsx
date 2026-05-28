"use client";

import { use, useState } from "react";
import Link from "next/link";
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
import { AvailabilityRow } from "@/@types/availability";
import { buildSchedule } from "@/lib/helpers/availability-slots";

// draft
interface DoctorDetail {
  id: string;
  specializationId: string;
  bio?: string | null;
  yearsOfPractice?: number | null;
  user: { name: string; email: string; mobileNumber: string };
  specialization: { label: string; description: string };
  availability: AvailabilityRow[];
}

const DOCTOR: DoctorDetail = {
  id: "doc-1",
  specializationId: "spec-1",
  yearsOfPractice: 14,
  bio: "Specializing in interventional cardiology and preventive heart care. Board-certified with extensive clinical trial experience across major medical centers in the Philippines.",
  user: {
    name: "Dr. Maria Santos",
    email: "maria.santos@telecare.ph",
    mobileNumber: "+63 917 555 0101",
  },
  specialization: {
    label: "Cardiology",
    description: "Heart and cardiovascular system",
  },
  // AvailabilityTemplate: dayOfWeek + startTime + endTime, hourly intervals
  availability: [
    { dayOfWeek: "MON", startTime: "09:00", endTime: "12:00" },
    { dayOfWeek: "WED", startTime: "13:00", endTime: "17:00" },
    { dayOfWeek: "SAT", startTime: "08:00", endTime: "10:00" },
  ],
};

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const doctor = DOCTOR;
  const schedule = buildSchedule(doctor.availability);

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

                {/* Timeslot pills — only available slots rendered, no disabled placeholders */}
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
