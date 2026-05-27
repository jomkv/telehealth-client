"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/shells/auth-shell";
import { extractErrorMessage } from "@/lib/helpers/extract-error-message";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user.api";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Enter valid email."),
  password: z.string().min(1, "Password required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useMutation({
    mutationFn: userApi.login,
  });

  const router = useRouter();
  const onSubmit = async (values: LoginFormValues) => {
    clearErrors("root");
    try {
      await login.mutateAsync(values);

      // toast successful login

      router.push("/");
    } catch (error) {
      const message = extractErrorMessage(error);

      setError("root", { message });
    }
  };

  return (
    <AuthShell
      title="Sign in"
      description="Continue your care journey with secure access to your clinician team."
      footer={
        <p className="text-center text-sm text-[#555555]">
          New here?{" "}
          <Link className="font-medium text-[#141413] underline" href="/signup">
            Create an account
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-12 w-full rounded-full border border-[#141413]/15 bg-white px-5 text-base text-[#141413] shadow-[inset_0_0_0_1px_rgba(20,20,19,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]/20"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-[#CF4500]">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm text-[#555555]">
          <span>Use same credentials as your provider invite.</span>
          <button
            type="button"
            className="font-medium text-[#141413] underline"
          >
            Forgot password
          </button>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-[#141413] text-[#F3F0EE] hover:bg-[#141413]/90"
          disabled={isSubmitting || login.isPending}
        >
          Sign in
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
