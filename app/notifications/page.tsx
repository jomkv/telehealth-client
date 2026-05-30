"use client";

import { PageHeader } from "@/components/nav/page-header";
import { fromNow } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification.api";
import { toast } from "sonner";
import { useSocketContext } from "@/components/providers/socket-provider";
import Empty from "@/components/ui-bits/empty";

export default function NotificationsPage() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.getAll,
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "notifications-latest"],
      });
      toast.success("Marked all as read");
    },
    onError: () => {
      toast.error("Something went wrong, please try again later");
    },
  });

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/login");
    }

    if (user && !user.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [user, router, hydrated]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification", (newNotif) => {
      queryClient.setQueryData(["notifications"], (prev: typeof items) => [
        newNotif,
        ...(prev ?? []),
      ]);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket, queryClient]);

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        description={`${isLoading ? "—" : unread} unread of ${isLoading ? "—" : items.length} total.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            disabled={unread === 0 || isLoading || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        }
      />
      <ul className="space-y-3">
        {isLoading && <Empty label="Loading notifications..." />}
        {!isLoading && items.length === 0 && (
          <Empty label="No notifications yet." />
        )}
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
