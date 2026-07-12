"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types/database";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/modules/notifications/actions";

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type NotificationListProps = {
  notifications: Notification[];
  emptyMessage?: string;
};

export function NotificationList({
  notifications,
  emptyMessage = "No notifications yet.",
}: NotificationListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (!result.success) {
        toast.error(result.error ?? "Failed to mark notifications as read.");
        return;
      }
      toast.success("All notifications marked as read.");
      router.refresh();
    });
  }

  function handleOpen(notification: Notification) {
    if (notification.isRead) return;
    startTransition(async () => {
      await markNotificationRead(notification.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {notifications.length > 0 ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || notifications.every((n) => n.isRead)}
            onClick={handleMarkAll}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Bell className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <Link
                href={notification.link}
                onClick={() => handleOpen(notification)}
                className={cn(
                  "block px-4 py-4 transition-colors hover:bg-muted/50",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {!notification.isRead ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                      <p className="truncate text-sm font-medium">
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
