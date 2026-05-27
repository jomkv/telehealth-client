import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";

export const formatDate = (d: string | Date) =>
  format(new Date(d), "MMM d, yyyy");
export const formatTime = (d: string | Date) => format(new Date(d), "h:mm a");
export const formatDateTime = (d: string | Date) =>
  format(new Date(d), "MMM d, yyyy · h:mm a");

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
