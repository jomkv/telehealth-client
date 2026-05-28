"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { doctorApi } from "@/lib/api/doctor.api";
import { userApi } from "@/lib/api/user.api";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { useUserStore } from "@/app/store";
import { Specialization } from "@/@types/doctor";

const toOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const doctorSchema = z.object({
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

type DoctorFormInput = z.input<typeof doctorSchema>;
type DoctorFormValues = z.output<typeof doctorSchema>;

export function DoctorForm() {
  const setUser = useUserStore((s) => s.setUser);
  const resetUser = useUserStore((s) => s.reset);
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const onboard = useMutation({
    mutationFn: userApi.onboardDoctor,
  });

  const { data: specializationOptions, isPending } = useQuery({
    queryKey: ["specializations"],
    queryFn: doctorApi.getSpecializations,
  });

  const onSubmit = async (values: DoctorFormValues) => {
    clearErrors("root");
    try {
      const user = await onboard.mutateAsync(values);

      resetUser();
      setUser(user);
      router.push("/");
      toast.success("Onboarding done");
    } catch (error) {
      const message = extractErrorMessage(error);
      setError("root", { message });
    }
  };

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormInput, unknown, DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      specializationId: "",
      bio: "",
      yearsOfPractice: undefined,
    },
  });

  const selectedId = useWatch({ control, name: "specializationId" });

  useEffect(() => {
    if (specializationOptions) {
      setSpecializations(specializationOptions);
    }
  }, [specializationOptions]);

  const selectedSpecialization = specializations.find(
    (item) => item.id === selectedId,
  );
  useEffect(() => {
    setShowFullDescription(false);
  }, [selectedId]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Specialization
        </label>
        <select
          className="h-12 w-full appearance-none rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
          {...register("specializationId")}
          disabled={isPending}
        >
          <option value="">Select specialization</option>
          {specializations.map((specialization) => (
            <option key={specialization.id} value={specialization.id}>
              {specialization.label}
            </option>
          ))}
        </select>
        {errors.specializationId ? (
          <p className="text-xs text-[#CF4500]">
            {errors.specializationId.message}
          </p>
        ) : null}
        {selectedSpecialization ? (
          <div className="space-y-2 text-sm text-[#555555]">
            <p>
              {showFullDescription
                ? selectedSpecialization.description
                : `${selectedSpecialization.description.slice(0, 220)}${
                    selectedSpecialization.description.length > 220 ? "..." : ""
                  }`}
            </p>
            {selectedSpecialization.description.length > 220 ? (
              <button
                type="button"
                className="text-xs font-medium text-[#141413] underline"
                onClick={() => setShowFullDescription((value) => !value)}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Bio (optional)
        </label>
        <textarea
          rows={3}
          placeholder="Short introduction for patients."
          className="w-full rounded-[24px] border border-[#141413]/15 bg-white px-5 py-3 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
          {...register("bio")}
        />
        {errors.bio ? (
          <p className="text-xs text-[#CF4500]">{errors.bio.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
          Years of practice (optional)
        </label>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          placeholder="8"
          className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
          {...register("yearsOfPractice")}
        />
        {errors.yearsOfPractice ? (
          <p className="text-xs text-[#CF4500]">
            {errors.yearsOfPractice.message}
          </p>
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
