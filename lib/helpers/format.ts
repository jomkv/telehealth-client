import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { PHT_TZ } from "../constants";

export const formatDate = (d: string | Date) =>
  format(new Date(d), "MMM d, yyyy");
export const formatTime = (d: string | Date) => format(new Date(d), "h:mm a");
export const formatDateTime = (d: string | Date) =>
  format(new Date(d), "MMM d, yyyy · h:mm a");
export const formatShortDate = (d: string | Date) =>
  format(new Date(d), "EEE, MMM d");
export const formatHour = (time: string): string => {
  const [h] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
};
export const formatDatePHT = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PHT_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatIsoDate = (d: string): string | undefined => {
  const isoStr = new Date(d).toISOString();
  const dateOnly = isoStr.split("T")?.[0];

  return dateOnly ?? undefined;
};

export const friendlyDay = (d: string | Date) => {
  const date = new Date(d);
  if (isToday(date)) return `Today, ${formatTime(date)}`;
  if (isTomorrow(date)) return `Tomorrow, ${formatTime(date)}`;
  if (isYesterday(date)) return `Yesterday, ${formatTime(date)}`;
  return formatDateTime(date);
};

export const fromNow = (d: string | Date) =>
  formatDistanceToNow(new Date(d), { addSuffix: true });

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
