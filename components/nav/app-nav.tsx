"use client";

import { NotificationBell } from "./notification-bell";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/app/store";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user.api";
import { toast } from "sonner";
import { UserAvatar } from "../avatars/user-avatar";

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
  { to: "/doctor/portfolio" as const, label: "Portfolio" },
];

export function AppNav() {
  const user = useUserStore((s) => s.user);
  const reset = useUserStore((s) => s.reset);
  const pathname = usePathname();
  const links = user?.role === "PATIENT" ? patientLinks : doctorLinks;

  const router = useRouter();

  const logout = useMutation({
    mutationFn: userApi.logout,
    onSuccess: () => {
      reset();
      router.replace("/login");
      toast.success("Logged out.");
    },
    onError: () => toast.error("Something went wrong. Please try again later."),
  });

  return (
    <div className="sticky top-6 z-40 mx-auto flex w-[min(1180px,calc(100%-2rem))] items-center gap-4 rounded-full bg-white px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <Link href="/" className="flex items-center gap-2 pr-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background text-xs font-bold">
          M
        </div>
        <span className="font-medium">Medra</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <UserAvatar
                name={user ? user.name : "A B"}
                src={user ? user.profilePic : null}
                className="h-9 w-9 ring-1 ring-border"
                fallbackClassName="bg-muted text-xl"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-md">
            {links.map((l) => (
              <DropdownMenuItem asChild key={l.to} className="md:hidden">
                <Link href={l.to}>{l.label}</Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
