import { useUserStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Field from "../field";
import { SPECIALIZATIONS } from "@/lib/mock-data/specialization";

const doctorSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  email: z.string().email(),
  mobileNumber: z.string().min(7).max(20),
  birthday: z.string().min(1),
  specializationId: z.string().min(1),
  yearsOfPractice: z.coerce.number().int().min(0).max(80),
  bio: z.string().max(1000).optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorProfile() {
  const user = useUserStore((s) => s.user);

  const isPending = false;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    values: user?.doctor
      ? {
          name: user?.name,
          email: user?.email,
          mobileNumber: user?.mobileNumber,
          birthday: new Date(user?.birthday).toISOString().slice(0, 10),
          specializationId: user?.doctor.specializationId,
          yearsOfPractice: user?.doctor.yearsOfPractice ?? 0,
          bio: user?.doctor.bio ?? "",
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
      <div className="space-y-1.5">
        <Label>Specialization</Label>
        <Select
          value={form.watch("specializationId")}
          onValueChange={(v) => form.setValue("specializationId", v)}
        >
          <SelectTrigger className="rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((s: { id: string; label: string }) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.specializationId && (
          <p className="text-xs text-destructive">
            {form.formState.errors.specializationId.message}
          </p>
        )}
      </div>
      <Field
        label="Years of practice"
        type="number"
        {...form.register("yearsOfPractice")}
        error={form.formState.errors.yearsOfPractice?.message}
      />
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Bio</Label>
        <Textarea rows={4} {...form.register("bio")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" className="rounded-full" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
