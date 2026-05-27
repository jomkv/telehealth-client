import * as React from "react";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#F3F0EE] text-[#141413]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-10 size-[320px] rounded-full border border-[#F37338]/50" />
          <div className="absolute bottom-10 left-8 size-[220px] rounded-full border border-[#CF4500]/30" />
          <div className="absolute -left-24 top-1/3 h-[1px] w-[520px] bg-[#F37338]/60" />
        </div>

        <div
          className={cn(
            "relative w-full overflow-hidden rounded-[40px] bg-[#FCFBFA]",
            "shadow-[0_24px_48px_rgba(0,0,0,0.08)]",
            className,
          )}
        >
          <div className="grid gap-12 px-8 py-12 md:grid-cols-[1.1fr_1fr] md:px-14">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#CF4500]">
                  <span className="size-2 rounded-full bg-[#CF4500]" />
                  Telehealth Access
                </p>
                <h1 className="text-4xl font-medium tracking-[-0.02em] md:text-5xl">
                  {title}
                </h1>
                <p className="text-base font-[450] leading-7 text-[#262627]">
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0_16px_30px_rgba(0,0,0,0.08)]">
                  <span className="text-2xl">→</span>
                </div>
                <p className="text-sm font-[450] text-[#555555]">
                  Secure, private access to your care team.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-[28px] border border-[#141413]/10 bg-white px-6 py-8 shadow-[0_18px_32px_rgba(0,0,0,0.06)]">
                {children}
              </div>
              {footer ? <div>{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
