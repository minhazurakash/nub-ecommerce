import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  href: string;
  unreadCount: number;
  className?: string;
  iconClassName?: string;
};

export function NotificationBell({
  href,
  unreadCount,
  className,
  iconClassName,
}: NotificationBellProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      asChild
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
    >
      <Link href={href}>
        <Bell className={cn("h-5 w-5", iconClassName)} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
