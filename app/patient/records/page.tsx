"use client";

import { Eyebrow } from "@/components/ui-bits/eyebrow";
import { PageHeader } from "@/components/nav/page-header";
import { formatDate } from "@/lib/helpers/format";
import { useUserStore } from "@/app/store";
import { filterPastConsultations } from "@/lib/helpers/consultation-counts";
import { useQuery } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation.api";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import ChipList from "./components/chip-list";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { patientApi } from "@/lib/api/patient.api";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import Empty from "@/components/ui-bits/empty";

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toOptionalArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length ? value : undefined;
  }
  return value;
};
const patientSchema = z.object({
  weight: z.preprocess(
    toNumber,
    z
      .number({
        invalid_type_error: "Enter weight.",
        required_error: "Enter weight.",
      })
      .positive("Weight must be greater than 0."),
  ),
  height: z.preprocess(
    toNumber,
    z
      .number({
        invalid_type_error: "Enter height.",
        required_error: "Enter height.",
      })
      .positive("Height must be greater than 0."),
  ),
  conditions: z.preprocess(
    toOptionalArray,
    z.array(z.string()).max(30, "Max of 30 conditions").optional(),
  ),
  allergies: z.preprocess(
    toOptionalArray,
    z.array(z.string()).max(30, "Max of 30 allergies").optional(),
  ),
  medications: z.preprocess(
    toOptionalArray,
    z.array(z.string()).max(30, "Max of 30 medications").optional(),
  ),
  notes: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(600, "Keep notes under 600 characters.").optional(),
  ),
});

type PatientFormInput = z.input<typeof patientSchema>;
type PatientFormValues = z.output<typeof patientSchema>;

export default function RecordsPage() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const setUser = useUserStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PatientFormInput, unknown, PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      conditions: [],
      allergies: [],
      medications: [],
      notes: "",
    },
  });

  const saveProfile = useMutation({
    mutationFn: patientApi.updateMe,
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    reset({
      weight: user?.patient?.weight ?? undefined,
      height: user?.patient?.height ?? undefined,
      conditions: user?.patient?.conditions ?? [],
      allergies: user?.patient?.allergies ?? [],
      medications: user?.patient?.medications ?? [],
      notes: user?.patient?.notes ?? "",
    });
  }, [hydrated, reset, user?.patient]);

  useEffect(() => {
    register("conditions");
    register("allergies");
    register("medications");
  }, [register]);

  const conditions =
    (useWatch({ control, name: "conditions" }) as string[] | undefined) ?? [];
  const allergies =
    (useWatch({ control, name: "allergies" }) as string[] | undefined) ?? [];
  const medications =
    (useWatch({ control, name: "medications" }) as string[] | undefined) ?? [];

  const { data: all = [] } = useQuery({
    queryKey: ["consultations", "patient", user?.patient?.id],
    queryFn: consultationApi.getMyConsultations,
    enabled: !!user?.patient?.id,
  });

  const past = filterPastConsultations(all);

  const updateList = (
    field: "conditions" | "allergies" | "medications",
    items: string[],
  ) => {
    setValue(field, items, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSave = async (values: PatientFormValues) => {
    if (!isDirty) {
      return;
    }

    clearErrors("root");

    try {
      const nextUser = await saveProfile.mutateAsync(values);

      setUser(nextUser);
      toast.success("Records updated");
    } catch (error) {
      setError("root", { message: extractErrorMessage(error) });
    }
  };

  return (
    <form className="space-y-10" onSubmit={handleSubmit(handleSave)}>
      <PageHeader
        eyebrow="Your health"
        title="Medical records"
        description="Your profile-level health info plus history from completed consultations."
      />

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 items-start">
        <div className="rounded-[2rem] bg-card p-6 space-y-3">
          <Eyebrow>Weight (kg)</Eyebrow>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="62"
            className="rounded-full"
            disabled={saveProfile.isPending || !hydrated}
            {...register("weight")}
          />
          {errors.weight ? (
            <p className="text-xs text-[#CF4500]">{errors.weight.message}</p>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-card p-6 space-y-3">
          <Eyebrow>Height (cm)</Eyebrow>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="168"
            className="rounded-full"
            disabled={saveProfile.isPending || !hydrated}
            {...register("height")}
          />
          {errors.height ? (
            <p className="text-xs text-[#CF4500]">{errors.height.message}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 rounded-[2rem] bg-card p-6 space-y-6">
          <ChipList
            label="Conditions"
            placeholder="Add condition"
            items={conditions}
            onChange={(items) => updateList("conditions", items)}
          />
          <ChipList
            label="Allergies"
            placeholder="Add allergy"
            items={allergies}
            onChange={(items) => updateList("allergies", items)}
          />
          <ChipList
            label="Medications"
            placeholder="Add medication"
            items={medications}
            onChange={(items) => updateList("medications", items)}
          />
          {errors.conditions || errors.allergies || errors.medications ? (
            <div className="space-y-1 text-xs text-[#CF4500]">
              {errors.conditions ? <p>{errors.conditions.message}</p> : null}
              {errors.allergies ? <p>{errors.allergies.message}</p> : null}
              {errors.medications ? <p>{errors.medications.message}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2 rounded-[2rem] bg-card p-6 space-y-3">
          <Eyebrow>Notes</Eyebrow>
          <Textarea
            rows={4}
            placeholder="Add anything your care team should know."
            disabled={saveProfile.isPending || !hydrated}
            {...register("notes")}
          />
          {errors.notes ? (
            <p className="text-xs text-[#CF4500]">{errors.notes.message}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={isSubmitting || saveProfile.isPending || !hydrated}
          >
            {isSubmitting || saveProfile.isPending
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

        {past.length === 0 && <Empty label="No completed consultations yet." />}

        <div className="space-y-4">
          {past.map((c) => (
            <div key={c.id} className="rounded-[2rem] bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.doctor.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.doctor.specialization.label} ·{" "}
                    {formatDate(c.scheduledAt)}
                  </p>
                </div>
              </div>
              {c.doctorNotes && (
                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-background p-4 font-sans text-sm text-foreground/80">
                  {c.doctorNotes}
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
