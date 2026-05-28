"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { userApi } from "@/lib/api/user.api";
import { useUserStore } from "@/app/store";

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
  conditions: z.preprocess(toOptionalArray, z.array(z.string()).optional()),
  allergies: z.preprocess(toOptionalArray, z.array(z.string()).optional()),
  medications: z.preprocess(toOptionalArray, z.array(z.string()).optional()),
  notes: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(600, "Keep notes under 600 characters.").optional(),
  ),
});

type PatientFormInput = z.input<typeof patientSchema>;
type PatientFormValues = z.output<typeof patientSchema>;

export function PatientForm() {
  const setUser = useUserStore((s) => s.setUser);
  const reset = useUserStore((s) => s.reset);
  const router = useRouter();
  const onboard = useMutation({
    mutationFn: userApi.onboardPatient,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
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

  const [conditionsInput, setConditionsInput] = useState("");
  const [allergiesInput, setAllergiesInput] = useState("");
  const [medicationsInput, setMedicationsInput] = useState("");

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

  const addItems = (
    field: "conditions" | "allergies" | "medications",
    inputValue: string,
    current: string[],
    reset: () => void,
  ) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const nextItems = trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nextItems.length) return;

    const merged = Array.from(new Set([...current, ...nextItems]));
    setValue(field, merged, { shouldValidate: true });
    reset();
  };

  const removeItem = (
    field: "conditions" | "allergies" | "medications",
    value: string,
    current: string[],
  ) => {
    const next = current.filter((item) => item !== value);
    setValue(field, next, { shouldValidate: true });
  };

  const onSubmit = async (values: PatientFormValues) => {
    clearErrors("root");
    try {
      const user = await onboard.mutateAsync(values);

      reset();
      setUser(user);
      router.push("/");
      toast.success("Onboarding done");
    } catch (error) {
      const message = extractErrorMessage(error);
      setError("root", { message });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
            Weight (kg)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="62"
            className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            {...register("weight")}
          />
          {errors.weight ? (
            <p className="text-xs text-[#CF4500]">{errors.weight.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
            Height (cm)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="168"
            className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            {...register("height")}
          />
          {errors.height ? (
            <p className="text-xs text-[#CF4500]">{errors.height.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Conditions (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {conditions.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3F0EE] px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                className="text-xs text-[#555555]"
                onClick={() => removeItem("conditions", item, conditions)}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Add condition"
            className="h-10 flex-1 rounded-full border border-[#141413]/15 bg-white px-4 text-sm text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            value={conditionsInput}
            onChange={(event) => setConditionsInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItems("conditions", conditionsInput, conditions, () =>
                  setConditionsInput(""),
                );
              }
            }}
          />
          <button
            type="button"
            className="h-10 rounded-full border border-[#141413]/20 px-4 text-sm"
            onClick={() =>
              addItems("conditions", conditionsInput, conditions, () =>
                setConditionsInput(""),
              )
            }
          >
            Add
          </button>
        </div>
        {errors.conditions ? (
          <p className="text-xs text-[#CF4500]">{errors.conditions.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Allergies (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {allergies.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3F0EE] px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                className="text-xs text-[#555555]"
                onClick={() => removeItem("allergies", item, allergies)}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Add allergy"
            className="h-10 flex-1 rounded-full border border-[#141413]/15 bg-white px-4 text-sm text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            value={allergiesInput}
            onChange={(event) => setAllergiesInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItems("allergies", allergiesInput, allergies, () =>
                  setAllergiesInput(""),
                );
              }
            }}
          />
          <button
            type="button"
            className="h-10 rounded-full border border-[#141413]/20 px-4 text-sm"
            onClick={() =>
              addItems("allergies", allergiesInput, allergies, () =>
                setAllergiesInput(""),
              )
            }
          >
            Add
          </button>
        </div>
        {errors.allergies ? (
          <p className="text-xs text-[#CF4500]">{errors.allergies.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Medications (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {medications.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3F0EE] px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                className="text-xs text-[#555555]"
                onClick={() => removeItem("medications", item, medications)}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Add medication"
            className="h-10 flex-1 rounded-full border border-[#141413]/15 bg-white px-4 text-sm text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            value={medicationsInput}
            onChange={(event) => setMedicationsInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItems("medications", medicationsInput, medications, () =>
                  setMedicationsInput(""),
                );
              }
            }}
          />
          <button
            type="button"
            className="h-10 rounded-full border border-[#141413]/20 px-4 text-sm"
            onClick={() =>
              addItems("medications", medicationsInput, medications, () =>
                setMedicationsInput(""),
              )
            }
          >
            Add
          </button>
        </div>
        {errors.medications ? (
          <p className="text-xs text-[#CF4500]">{errors.medications.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Notes (optional)
        </label>
        <textarea
          rows={3}
          placeholder="Add anything your care team should know."
          className="w-full rounded-[24px] border border-[#141413]/15 bg-white px-5 py-3 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="text-xs text-[#CF4500]">{errors.notes.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full bg-[#141413] text-[#F3F0EE] hover:bg-[#141413]/90"
        disabled={isSubmitting || onboard.isPending}
      >
        Complete onboarding
      </Button>
      {errors.root?.message ? (
        <p className="text-center text-sm text-[#CF4500]">
          {errors.root.message}
        </p>
      ) : null}
    </form>
  );
}
