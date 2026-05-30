"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { StatusPill } from "@/components/ui-bits/status-pill";
import { friendlyDay, formatDate } from "@/lib/helpers/format";
import { Video, XCircle, Save, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { consultationApi } from "@/lib/api/consultation.api";
import Empty from "@/components/ui-bits/empty";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserAvatar } from "@/components/avatars/user-avatar";

function Tag({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          items.map((it) => (
            <span
              key={it}
              className="rounded-full bg-background px-2.5 py-0.5 text-xs"
            >
              {it}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

const notesSchema = z.object({
  notes: z
    .string()
    .min(8, "Notes must be at least 8 characters.")
    .max(600, "Keep notes under 600 characters."),
});

type NotesFormValues = z.infer<typeof notesSchema>;

export default function DoctorConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: c, isLoading } = useQuery({
    queryKey: ["consultation", id],
    queryFn: () => consultationApi.getConsultation(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: { notes: "" },
  });

  useEffect(() => {
    if (c) reset({ notes: c.doctorNotes ?? "" });
  }, [c, reset]);

  const cancelMutation = useMutation({
    mutationFn: () => consultationApi.cancelConsultation(id),
    onSuccess: () => {
      toast.success("Consultation cancelled.");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: () => toast.error("Failed to cancel. Please try again."),
  });

  const saveNotesMutation = useMutation({
    mutationFn: (values: NotesFormValues) =>
      consultationApi.saveConsultationNotes(id, values.notes),
    onSuccess: () => {
      toast.success("Notes saved.");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
    },
    onError: () => toast.error("Failed to save notes. Please try again."),
  });

  if (isLoading) {
    return <Empty label="Loading patient consultation..." />;
  }

  if (!c) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Consultation not found.
      </div>
    );
  }

  const p = c.patient;
  const canJoin = c.status === "PENDING" || c.status === "ONGOING";

  return (
    <div className="space-y-10">
      <Link
        href="/doctor/consultations"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All consultations
      </Link>

      {/* Header card */}
      <section className="rounded-[2.5rem] bg-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <UserAvatar
              name={p.user.name}
              src={p.user.profilePic}
              className="h-20 w-20 ring-1 ring-border"
              fallbackClassName="bg-muted text-xl"
            />
            <div>
              <Eyebrow>Patient</Eyebrow>
              <h1 className="mt-2 text-3xl">{p.user.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {friendlyDay(c.scheduledAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                DOB {formatDate(p.user.birthday)} · {p.user.mobileNumber}
              </p>
            </div>
          </div>
          <StatusPill status={c.status} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canJoin && c.meetingLink && (
            <Button asChild className="rounded-full">
              <a href={c.meetingLink} target="_blank" rel="noreferrer">
                <Video className="mr-1.5 h-4 w-4" aria-hidden />
                Join consultation
              </a>
            </Button>
          )}
          {c.status === "PENDING" && (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
              Cancel
            </Button>
          )}
        </div>
      </section>

      {/* Detail grid */}
      <section className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Patient summary sidebar */}
        <div className="rounded-[2rem] bg-card p-6 md:col-span-1">
          <Eyebrow>Patient summary</Eyebrow>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Weight</dt>
              <dd>{p.weight} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Height</dt>
              <dd>{p.height} cm</dd>
            </div>
          </dl>
          <div className="mt-5 space-y-3">
            <Tag label="Conditions" items={p.conditions} />
            <Tag label="Allergies" items={p.allergies} />
            <Tag label="Medications" items={p.medications} />
          </div>
          <Link
            href={`/doctor/patients/${p.id}`}
            className="mt-5 inline-block text-sm underline"
          >
            View full patient record →
          </Link>
        </div>

        {/* Notes column */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-[2rem] bg-card p-6">
            <Eyebrow>Patient&rsquo;s notes at booking</Eyebrow>
            <p className="mt-4 text-foreground/80">{c.patientNotes || "—"}</p>
          </div>

          <div className="rounded-[2rem] bg-card p-6">
            <Eyebrow>Your consultation notes</Eyebrow>
            <p className="mt-2 text-xs text-muted-foreground">
              Markdown supported. Cover directions, recommendations, and
              medications.
            </p>
            <form
              onSubmit={handleSubmit((values) =>
                saveNotesMutation.mutate(values),
              )}
            >
              <Textarea
                rows={10}
                className="mt-4"
                placeholder="Patient reports… Plan…"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.notes.message}
                </p>
              )}
              <Button
                type="submit"
                className="mt-4 rounded-full"
                disabled={saveNotesMutation.isPending}
              >
                <Save className="mr-1.5 h-4 w-4" aria-hidden />
                Save notes
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
