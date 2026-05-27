import { AvailabilityRow, Day, WeekState } from "@/@types/availability";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

export const slotCount = (startTime: string, endTime: string): number => {
  const start = parseInt(startTime.split(":")[0], 10);
  const end = parseInt(endTime.split(":")[0], 10);
  return Math.max(0, end - start);
};

export const buildInitialState = (
  days: Day[],
  rows: AvailabilityRow[],
): WeekState => {
  const map = Object.fromEntries(rows.map((r) => [r.dayOfWeek, r]));
  return Object.fromEntries(
    days.map(({ key }) => [
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
