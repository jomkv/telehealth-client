"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fromNow } from "@/lib/helpers/format";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification.api";

export function NotificationBell() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getLatest,
  });

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative grid h-10 w-10 place-items-center rounded-full bg-background transition hover:bg-muted">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--signal)] text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <span className="text-xs font-normal text-muted-foreground">
            {unread} unread
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="text-center font-extralight py-5">No notifications</p>
        )}
        {items.slice(0, 4).map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex flex-col items-start gap-1 py-3"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <p className="text-sm font-medium">{n.title}</p>
              {!n.isRead && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--signal)]" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{n.body}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {fromNow(n.createdAt)}
            </p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
