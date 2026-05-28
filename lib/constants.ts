import { Day, DayOfWeek } from "@/@types/availability";

export const DAYS: Day[] = [
  { key: "MON", label: "Monday" },
  { key: "TUE", label: "Tuesday" },
  { key: "WED", label: "Wednesday" },
  { key: "THU", label: "Thursday" },
  { key: "FRI", label: "Friday" },
  { key: "SAT", label: "Saturday" },
  { key: "SUN", label: "Sunday" },
];

export const DAY_LABELS = Object.fromEntries(
  DAYS.map(({ key, label }) => [key, label]),
) as Record<DayOfWeek, string>;

export const DAY_KEYS_BY_INDEX: DayOfWeek[] = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

// Hourly options 00:00 – 23:00
export const HOURS: string[] = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`, // Format to "HH:00", fixed 00 minutes
);

export const PHT_TZ = "Asia/Manila";
export const PHT_OFFSET_MS = 8 * 60 * 60 * 1000;
