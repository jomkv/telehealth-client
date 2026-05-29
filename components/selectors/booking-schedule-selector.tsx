import { PopulatedDoctorWithAvailability } from "@/@types/doctor";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { doctorApi } from "@/lib/api/doctor.api";
import {
  buildBookedSlotRange,
  buildSchedule,
  buildUpcomingDateOptions,
  dayKeyFromDate,
  slotToUtcIso,
} from "@/lib/helpers/availability-slots";
import { formatDatePHT, formatHour } from "@/lib/helpers/format";
import { useQueryClient } from "@tanstack/react-query";
import { isSameDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";

interface Props {
  doctor: PopulatedDoctorWithAvailability;
  handleInitiateBooking: (selectedDate: Date, selectedTimeSlot: string) => void;
  label: string;
}

export default function BookingScheduleSelector({
  doctor,
  handleInitiateBooking,
  label,
}: Props) {
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

  return (
    <section className="rounded-[2.5rem] bg-card p-8 space-y-8">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2 className="mt-2 text-xl font-medium">Pick a time</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a date and time slot below.
        </p>
      </div>

      {dateOptions.length <= 0 && (
        <p className="text-sm text-muted-foreground">
          No availability published right now.
        </p>
      )}

      {dateOptions.length > 0 && (
        <>
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
                    aria-pressed={!!isSelected}
                  >
                    {formatDatePHT(option.date)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-foreground">
              Available times
            </p>
            {selectedDate && (
              <>
                {visibleSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No remaining slots for this date.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visibleSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() =>
                          handleInitiateBooking(selectedDate, time)
                        }
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:bg-foreground hover:text-background"
                      >
                        {formatHour(time)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
