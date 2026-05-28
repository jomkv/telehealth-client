import { ConsultationView } from "@/@types/consultation";
import { isToday } from "date-fns";

export const filterUpcomingConsultations = (
  consults: ConsultationView[],
): ConsultationView[] => {
  const sorted = consults
    .filter((c) => c.status === "PENDING" || c.status === "ONGOING")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return sorted;
};

export const filterPastConsultations = (
  consults: ConsultationView[],
): ConsultationView[] => {
  const sorted = consults
    .filter((c) => c.status === "DONE")
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  return sorted;
};

export const filterCancelledConsultations = (
  consults: ConsultationView[],
): ConsultationView[] => {
  return consults.filter((c) => c.status === "CANCELLED");
};

export const getConsultationCounts = (consults: ConsultationView[]) => {
  const todayCount = consults.filter((c) => isToday(new Date(c.scheduledAt)));

  const upcomingCount = consults.filter(
    (c) => c.status === "PENDING" || c.status === "ONGOING",
  );

  const completedCount = consults.filter((c) => c.status === "DONE").length;

  return {
    todayCount,
    upcomingCount,
    completedCount,
  };
};
