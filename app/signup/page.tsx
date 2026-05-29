"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/shells/auth-shell";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user.api";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { useEffect } from "react";
import { useUserStore } from "../store";

const roleOptions = ["PATIENT", "DOCTOR"] as const;

const isNumeric = (value: string) =>
  value.split("").every((char) => char >= "0" && char <= "9");

const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must not 100 exceed characters."),
  email: z.string().email("Enter valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(roleOptions, {
    required_error: "Select a role.",
    invalid_type_error: "Select a role.",
  }),
  birthday: z.string().min(1, "Birthday is required."),
  mobileNumber: z
    .string()
    .length(10, "Enter 10 digits after +63.")
    .refine(isNumeric, "Digits only."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "PATIENT",
      birthday: "",
      mobileNumber: "",
    },
  });

  const user = useUserStore((s) => s.user);
  const signup = useMutation({
    mutationFn: userApi.signup,
  });
  const router = useRouter();

  const onSubmit = async (values: SignupFormValues) => {
    clearErrors("root");
    try {
      await signup.mutateAsync(values);

      // toast successful signup

      router.push("/login");
    } catch (error) {
      const message = extractErrorMessage(error);

      setError("root", { message });
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  return (
    <AuthShell
      title="Create your account"
      description="Start a care plan tailored for you. Choose your role and add your contact details."
      footer={
        <p className="text-center text-sm text-[#555555]">
          Already have an account?{" "}
          <Link className="font-medium text-[#141413] underline" href="/login">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
              Full name
            </label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Juan dela Cruz"
              className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-[#CF4500]">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
              Role
            </label>
            <select
              className="h-12 w-full appearance-none rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
              {...register("role")}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
            {errors.role ? (
              <p className="text-xs text-[#CF4500]">{errors.role.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-[#CF4500]">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-[#CF4500]">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
              Birthday
            </label>
            <input
              type="date"
              className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
              {...register("birthday")}
            />
            {errors.birthday ? (
              <p className="text-xs text-[#CF4500]">
                {errors.birthday.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.22em] text-[#696969]">
              Mobile number
            </label>
            <div className="flex h-12 items-center rounded-full border border-[#141413]/15 bg-white px-4 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] focus-within:ring-2 focus-within:ring-[#141413]/20">
              <span className="text-sm font-semibold">+63</span>
              <span className="mx-3 h-6 w-px bg-[#141413]/15" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="10-digit number"
                maxLength={10}
                className="h-full flex-1 bg-transparent outline-none"
                {...register("mobileNumber")}
              />
            </div>
            {errors.mobileNumber ? (
              <p className="text-xs text-[#CF4500]">
                {errors.mobileNumber.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-[#141413] text-[#F3F0EE] hover:bg-[#141413]/90"
          disabled={isSubmitting || signup.isPending}
        >
          Create account
        </Button>
        {errors.root?.message ? (
          <p className="text-center text-sm text-[#CF4500]">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </AuthShell>
  );
}
