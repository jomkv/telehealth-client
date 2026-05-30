"use client";

import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { PageHeader } from "@/components/nav/page-header";
import { formatDate } from "@/lib/helpers/format";
import { useUserStore } from "@/app/store";
import { filterPastConsultations } from "@/lib/helpers/consultation-counts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doctorApi } from "@/lib/api/doctor.api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { useWatch } from "react-hook-form";
import Empty from "@/components/ui-bits/empty";

const toOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const portfolioSchema = z.object({
  specializationId: z.string().min(1, "Select a specialization."),
  bio: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(400, "Keep bio under 400 characters.").optional(),
  ),
  yearsOfPractice: z.preprocess(
    toOptionalNumber,
    z
      .number({ invalid_type_error: "Use whole number." })
      .int("Use whole number.")
      .min(0, "Years must be 0 or greater.")
      .optional(),
  ),
});

type PortfolioFormInput = z.input<typeof portfolioSchema>;
type PortfolioFormValues = z.output<typeof portfolioSchema>;

export default function PortfolioPage() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const setUser = useUserStore((s) => s.setUser);

  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PortfolioFormInput, unknown, PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      specializationId: "",
      bio: "",
      yearsOfPractice: undefined,
    },
  });

  const saveProfile = useMutation({
    mutationFn: doctorApi.updateMe,
  });

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["consultations", "doctor", user?.doctor?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.doctor?.id,
  });

  const {
    data: specializations,
    isPending: isSpecializationsPending,
    error: specializationsError,
  } = useQuery({
    queryKey: ["specializations"],
    queryFn: doctorApi.getSpecializations,
  });

  const specializationId = useWatch({ control, name: "specializationId" });

  const past = filterPastConsultations(all);

  const firstName = user?.name.split(" ")[0] || "Doctor";

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    reset({
      bio: user?.doctor?.bio ?? "",
      yearsOfPractice: user?.doctor?.yearsOfPractice ?? undefined,
    });
  }, [hydrated, reset, user?.doctor?.bio, user?.doctor?.yearsOfPractice]);

  useEffect(() => {
    if (!hydrated || !specializations?.length) {
      return;
    }

    const candidateId =
      user?.doctor?.specialization?.id ?? user?.doctor?.specializationId;

    if (!candidateId) {
      return;
    }

    const matchedSpecialization = specializations.find(
      (item) => item.id === candidateId,
    );

    if (
      !matchedSpecialization ||
      specializationId === matchedSpecialization.id
    ) {
      return;
    }

    reset(
      {
        specializationId: matchedSpecialization.id,
        bio: user?.doctor?.bio ?? "",
        yearsOfPractice: user?.doctor?.yearsOfPractice ?? undefined,
      },
      { keepDirtyValues: true, keepTouched: true },
    );
  }, [
    hydrated,
    reset,
    specializationId,
    specializations,
    user?.doctor?.bio,
    user?.doctor?.specialization?.id,
    user?.doctor?.specializationId,
    user?.doctor?.yearsOfPractice,
  ]);

  const onSubmit = async (values: PortfolioFormValues) => {
    if (!isDirty) {
      return;
    }

    clearErrors("root");

    try {
      const nextUser = await saveProfile.mutateAsync(values);

      setUser(nextUser);
      toast.success("Portfolio updated");
    } catch (error) {
      setError("root", { message: extractErrorMessage(error) });
    }
  };

  return (
    <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        eyebrow={`Nice job, ${firstName || "doctor"}`}
        title="Portfolio"
        description="Your professional credentials plus history of completed consultations."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-card p-6">
          <Eyebrow>Specialty</Eyebrow>
          <Controller
            control={control}
            name="specializationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={
                  isSpecializationsPending ||
                  saveProfile.isPending ||
                  !hydrated ||
                  isSubmitting
                }
              >
                <SelectTrigger className="mt-3 w-full">
                  <SelectValue placeholder="Select a specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.specializationId ? (
            <p className="mt-2 text-xs text-[#CF4500]">
              {errors.specializationId.message}
            </p>
          ) : null}
          {specializationsError ? (
            <p className="mt-2 text-xs text-[#CF4500]">
              {extractErrorMessage(specializationsError)}
            </p>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-card p-6">
          <Eyebrow>Years of Practice</Eyebrow>
          <Input
            className="mt-3"
            type="number"
            min={0}
            disabled={saveProfile.isPending || !hydrated}
            {...register("yearsOfPractice")}
          />
          {errors.yearsOfPractice ? (
            <p className="mt-2 text-xs text-[#CF4500]">
              {errors.yearsOfPractice.message}
            </p>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-card p-6 sm:col-span-2">
          <Eyebrow>Bio</Eyebrow>
          <Textarea
            rows={5}
            className="mt-3"
            disabled={saveProfile.isPending || !hydrated}
            {...register("bio")}
          />
          {errors.bio ? (
            <p className="mt-2 text-xs text-[#CF4500]">{errors.bio.message}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={
              isSubmitting ||
              saveProfile.isPending ||
              !hydrated ||
              isSpecializationsPending
            }
          >
            {isSpecializationsPending
              ? "Loading..."
              : isSubmitting || saveProfile.isPending
                ? "Saving..."
                : "Apply Changes"}
          </Button>
        </div>
        {errors.root?.message ? (
          <p className="sm:col-span-2 text-right text-sm text-[#CF4500]">
            {errors.root.message}
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <Eyebrow>Consultation history</Eyebrow>

        {isLoading && <Empty label="Loading consultation history..." />}
        {!isLoading && past.length === 0 && (
          <Empty label="No consultations done yet." />
        )}

        <div className="space-y-4">
          {past.map((c) => (
            <div key={c.id} className="rounded-[2rem] bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.patient.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.patient.weight}kg · {c.patient.height}cm ·{" "}
                    {formatDate(c.scheduledAt)}
                  </p>
                </div>
              </div>

              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-background p-4 font-sans text-sm text-foreground/80">
                {c.patientNotes}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
