"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/helpers/format";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/app/store";
import Link from "next/link";

const patientLinks = [
  { to: "/patient" as const, label: "Home" },
  { to: "/patient/doctors" as const, label: "Find doctors" },
  { to: "/patient/consultations" as const, label: "Consultations" },
  { to: "/patient/records" as const, label: "Records" },
];

const doctorLinks = [
  { to: "/doctor" as const, label: "Home" },
  { to: "/doctor/availability" as const, label: "Availability" },
  { to: "/doctor/consultations" as const, label: "Consultations" },
];

export function AppNav() {
  const user = useUserStore((s) => s.user);
  const pathname = usePathname();
  const links = user?.role === "PATIENT" ? patientLinks : doctorLinks;

  return (
    <div className="sticky top-6 z-40 mx-auto flex w-[min(1180px,calc(100%-2rem))] items-center gap-4 rounded-full bg-white px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <Link href="/" className="flex items-center gap-2 pr-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background text-xs font-bold">
          T
        </div>
        <span className="font-medium">Telecare</span>
      </Link>
      <nav className="hidden flex-1 items-center gap-1 md:flex">
        {links.map((l) => {
          const active =
            pathname === l.to ||
            (l.to !== "/patient" &&
              l.to !== "/doctor" &&
              pathname.startsWith(l.to));
          return (
            <Link
              key={l.to}
              href={l.to}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/80 hover:bg-muted",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <Link href="/profile" className="flex items-center gap-2">
          <Avatar className="h-9 w-9 ring-1 ring-border">
            <AvatarFallback className="bg-muted text-xs">
              {user ? initials(user.name) : "AB"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}
