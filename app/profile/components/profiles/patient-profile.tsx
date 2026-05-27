import { useUserStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Field from "../field";

const patientSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  email: z.string().email(),
  mobileNumber: z.string().min(7).max(20),
  birthday: z.string().min(1),
  weight: z.coerce.number().positive().max(500),
  height: z.coerce.number().positive().max(300),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientProfile() {
  const user = useUserStore((s) => s.user);

  const isPending = false;

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    values: user?.patient
      ? {
          name: user?.name,
          email: user?.email,
          mobileNumber: user?.mobileNumber,
          birthday: new Date(user?.birthday).toISOString().slice(0, 10),
          weight: user?.patient.weight,
          height: user?.patient.height,
        }
      : undefined,
  });

  return (
    <form
      onSubmit={form.handleSubmit(() => undefined)}
      className="grid gap-5 rounded-[2rem] bg-card p-8 sm:grid-cols-2"
    >
      <Field
        label="Full name"
        {...form.register("name")}
        error={form.formState.errors.name?.message}
      />
      <Field
        label="Email"
        type="email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <Field
        label="Mobile number"
        {...form.register("mobileNumber")}
        error={form.formState.errors.mobileNumber?.message}
      />
      <Field
        label="Birthday"
        type="date"
        {...form.register("birthday")}
        error={form.formState.errors.birthday?.message}
      />
      <Field
        label="Weight (kg)"
        type="number"
        step="0.1"
        {...form.register("weight")}
        error={form.formState.errors.weight?.message}
      />
      <Field
        label="Height (cm)"
        type="number"
        step="0.1"
        {...form.register("height")}
        error={form.formState.errors.height?.message}
      />
      <div className="sm:col-span-2">
        <Button type="submit" className="rounded-full" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
