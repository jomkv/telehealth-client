import { AvailabilityRow, DayOfWeek, WeekState } from "@/@types/availability";
import {
  DAYS,
  DAY_KEYS_BY_INDEX,
  HOURS,
  PHT_OFFSET_MS,
  PHT_TZ,
} from "../constants";
import { formatShortDate } from "./format";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

// ---------------------------------------------------------------------------
// PHT helpers
// ---------------------------------------------------------------------------

/** Returns "YYYY-MM-DD" for a Date in PHT (Asia/Manila). */
const toPhtYmd = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: PHT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

/**
 * Converts a PHT calendar date + hour to a UTC ISO string (top-of-hour).
 * Use this when comparing candidate slots against `bookedSlots` from the API,
 * or when constructing a `scheduledAt` ISO to send to the backend.
 */
export const slotToUtcIso = (date: Date, hour: number): string => {
  const [y, m, d] = toPhtYmd(date).split("-").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, hour, 0, 0) - PHT_OFFSET_MS,
  ).toISOString();
};

/**
 * Builds the `from` / `to` UTC ISO range covering the provided date options,
 * using PHT day boundaries. Pass directly to `doctorApi.getDoctor(id, from, to)`.
 */
export const buildBookedSlotRange = (
  dateOptions: Array<{ date: Date }>,
): { from: string; to: string } => {
  const first = dateOptions[0].date;
  const last = dateOptions[dateOptions.length - 1].date;

  const [fy, fm, fd] = toPhtYmd(first).split("-").map(Number);
  const [ly, lm, ld] = toPhtYmd(last).split("-").map(Number);

  const from = new Date(
    Date.UTC(fy, fm - 1, fd, 0, 0, 0) - PHT_OFFSET_MS,
  ).toISOString();
  const to = new Date(
    Date.UTC(ly, lm - 1, ld, 0, 0, 0) - PHT_OFFSET_MS + 24 * 60 * 60 * 1000,
  ).toISOString();

  return { from, to };
};

// ---------------------------------------------------------------------------
// Slot / schedule helpers
// ---------------------------------------------------------------------------

export const slotCount = (startTime: string, endTime: string): number => {
  const start = parseInt(startTime.split(":")[0], 10);
  const end = parseInt(endTime.split(":")[0], 10);
  return Math.max(0, end - start);
};

// Initial form state of doctor availability menu
export const buildInitialState = (rows: AvailabilityRow[]): WeekState => {
  const map = Object.fromEntries(rows.map((r) => [r.dayOfWeek, r]));
  return Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      map[key]
        ? {
            enabled: true,
            startTime: map[key].startTime,
            endTime: map[key].endTime,
          }
        : { enabled: false, startTime: DEFAULT_START, endTime: DEFAULT_END },
    ]),
  ) as WeekState;
};

export const expandSlots = (startTime: string, endTime: string): string[] => {
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);

  return HOURS.slice(startH, endH);
};

// Available timeslots to be displayed on doctors menu
export const buildSchedule = (
  availability: AvailabilityRow[],
): Array<{
  day: DayOfWeek;
  label: string;
  slots: string[];
}> => {
  const map = new Map<DayOfWeek, string[]>();
  for (const a of availability) {
    map.set(a.dayOfWeek, expandSlots(a.startTime, a.endTime));
  }
  return DAYS.filter(({ key }) => map.has(key)).map(({ key, label }) => ({
    day: key,
    label,
    slots: map.get(key)!,
  }));
};

export const buildScheduledAtFromSlot = (
  day: DayOfWeek,
  time: string,
  now: Date = new Date(),
) => {
  const [hours, minutes] = time.split(":").map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  const targetDay = DAY_INDEX[day];
  let diff = (targetDay - currentDay + 7) % 7;

  if (diff === 0 && target <= now) {
    diff = 7;
  }

  target.setDate(now.getDate() + diff);
  return target.toISOString();
};

/**
 * Builds a `scheduledAt` UTC ISO string from a PHT calendar date and a
 * "HH:00" slot time. Uses PHT-aware conversion so it's correct regardless
 * of the browser's local timezone.
 */
export const buildScheduledAtFromDateSlot = (
  date: Date,
  time: string,
): string => {
  const [hours] = time.split(":").map(Number);
  return slotToUtcIso(date, hours);
};

export const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const dayKeyFromDate = (date: Date): DayOfWeek =>
  DAY_KEYS_BY_INDEX[date.getDay()];

export const buildUpcomingDateOptions = (
  schedule: Array<{ day: DayOfWeek }>,
  horizonDays = 21,
  now: Date = new Date(),
) => {
  if (!schedule.length) return [];

  const availableDays = new Set(schedule.map(({ day }) => day));
  const options: Array<{ date: Date; day: DayOfWeek; label: string }> = [];

  for (let offset = 0; offset < horizonDays; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const day = dayKeyFromDate(date);
    if (!availableDays.has(day)) continue;
    options.push({ date, day, label: formatShortDate(date) });
  }

  return options;
};
