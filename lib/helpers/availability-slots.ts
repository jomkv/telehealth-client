import { AvailabilityRow, DayOfWeek, WeekState } from "@/@types/availability";
import { DAYS } from "../constants";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

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
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
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
