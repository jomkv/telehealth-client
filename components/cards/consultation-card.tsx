import Link from "next/link";
import { Video, FileText, CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusPill } from "../ui-bits/status-pill";
import { ConsultationView } from "@/@types/consultation";
import { friendlyDay, initials } from "@/lib/helpers/format";

interface ConsultationCardProps {
  consultation: ConsultationView;
  viewerRole: "PATIENT" | "DOCTOR";
}

export function ConsultationCard({
  consultation,
  viewerRole,
}: ConsultationCardProps) {
  const counterpart =
    viewerRole === "PATIENT"
      ? consultation.doctor.user
      : consultation.patient.user;

  const subtitle =
    viewerRole === "PATIENT"
      ? consultation.doctor.specialization.label
      : `Patient · ${consultation.patient.conditions[0] ?? "General consult"}`;

  const canJoin =
    consultation.status === "PENDING" || consultation.status === "ONGOING";

  const detailsHref =
    viewerRole === "PATIENT"
      ? `/patient/consultations/${consultation.id}`
      : `/doctor/consultations/${consultation.id}`;

  return (
    <div className="rounded-[2rem] bg-card p-6 sm:p-7">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-muted">
              {initials(counterpart.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-lg font-medium">{counterpart.name}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground/80">
              <CalendarClock className="h-4 w-4" aria-hidden />
              {friendlyDay(consultation.scheduledAt)}
            </p>
          </div>
        </div>

        <StatusPill status={consultation.status} />
      </div>

      {/* Patient notes preview */}
      {consultation.patientNotes && (
        <p className="mt-4 line-clamp-2 rounded-2xl bg-background p-4 text-sm text-foreground/80">
          &ldquo;{consultation.patientNotes}&rdquo;
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={detailsHref}>
            <FileText className="mr-1.5 h-4 w-4" aria-hidden />
            View details
          </Link>
        </Button>

        {canJoin && consultation.meetingLink && (
          <Button asChild className="rounded-full">
            <a href={consultation.meetingLink} target="_blank" rel="noreferrer">
              <Video className="mr-1.5 h-4 w-4" aria-hidden />
              Join consultation
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
