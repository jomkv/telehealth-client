export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface AvailabilityRow {
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface DayState {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export type WeekState = Record<DayOfWeek, DayState>;

export interface Day {
  key: DayOfWeek;
  label: string;
}
