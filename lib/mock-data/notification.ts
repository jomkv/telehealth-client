import { Notification } from "@/@types/notification";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const addHours = (n: number) => iso(new Date(now.getTime() + n * 3600_000));

export const notifications: Notification[] = [
  {
    id: "n-1",
    userId: "u-p-1",
    title: "Consultation confirmed",
    body: "Your consultation with Dr. Elena Reyes is confirmed for tomorrow.",
    isRead: false,
    createdAt: addHours(-2),
  },
  {
    id: "n-2",
    userId: "u-p-1",
    title: "Reschedule successful",
    body: "Your consultation with Dr. Amara Okafor was moved to a new time.",
    isRead: false,
    createdAt: addHours(-12),
  },
  {
    id: "n-3",
    userId: "u-p-1",
    title: "New consultation notes",
    body: "Dr. Elena Reyes added notes to your recent consultation.",
    isRead: true,
    createdAt: addHours(-24 * 13),
  },
  {
    id: "n-4",
    userId: "u-d-1",
    title: "New booking",
    body: "Marco dela Cruz booked a consultation for later today.",
    isRead: false,
    createdAt: addHours(-6),
  },
  {
    id: "n-5",
    userId: "u-d-1",
    title: "Patient rescheduled",
    body: "Ava Santos rescheduled her appointment.",
    isRead: false,
    createdAt: addHours(-18),
  },
  {
    id: "n-6",
    userId: "u-d-1",
    title: "Upcoming today",
    body: "Reminder: 3 consultations on your schedule today.",
    isRead: true,
    createdAt: addHours(-26),
  },
];
