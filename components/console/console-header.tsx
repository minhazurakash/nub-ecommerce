"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useNotificationCount } from "@/components/notifications/notification-count-context";
import { signOut } from "@/modules/auth/actions";
import { cn } from "@/lib/utils";

type ConsoleHeaderProps = {
  title: string;
  description?: string;
  user?: {
    name?: string | null;
    email?: string;
    avatarUrl?: string | null;
  };
  /** @deprecated Prefer layout NotificationCountProvider */
  unreadCount?: number;
  showNotifications?: boolean;
  className?: string;
};

function getInitials(name?: string | null, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() ?? "BB";
}

export function ConsoleHeader({
  title,
  description,
  user,
  unreadCount: unreadCountProp,
  showNotifications = true,
  className,
}: ConsoleHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { count: contextCount, enabled: notificationsEnabled } =
    useNotificationCount();
  const unreadCount = unreadCountProp ?? contextCount;
  const shouldShowNotifications =
    showNotifications && (unreadCountProp !== undefined || notificationsEnabled);

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-border bg-card px-6",
        className
      )}
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {shouldShowNotifications ? (
          <NotificationBell
            href="/console/notifications"
            unreadCount={unreadCount}
            className="h-9 w-9"
            iconClassName="h-4 w-4"
          />
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.avatarUrl ?? undefined}
                  alt={user?.name ?? "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name ?? "Admin"}</p>
              {user?.email ? (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer">
                <User className="h-4 w-4" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
