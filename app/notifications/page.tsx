"use client";

import { PageHeader } from "@/components/nav/page-header";
import { fromNow } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Notification } from "@/@types/notification";

export default function NotificationsPage() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }

    if (user && !user.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  // TODO: query
  const items: Notification[] = [];
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        description={`${unread} unread of ${items.length} total.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            disabled={unread === 0}
          >
            Mark all read
          </Button>
        }
      />
      <ul className="space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className="flex items-start justify-between gap-4 rounded-[1.5rem] bg-card p-5"
          >
            <div className="flex-1">
              <p className="text-base font-medium flex items-center gap-2">
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-[var(--signal)]" />
                )}
                {n.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {fromNow(n.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
