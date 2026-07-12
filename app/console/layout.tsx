export const dynamic = "force-dynamic";

import { requireAdmin } from "@/modules/auth/actions";
import { Role } from "@/lib/types/database";
import { ConsoleSidebar } from "@/components/console/console-sidebar";
import { NotificationCountProvider } from "@/components/notifications/notification-count-context";
import { getUnreadNotificationCount } from "@/modules/notifications/queries";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const unreadCount =
    user.role === Role.ADMIN
      ? await getUnreadNotificationCount(user.id)
      : 0;

  return (
    <NotificationCountProvider
      count={unreadCount}
      enabled={user.role === Role.ADMIN}
    >
      <div className="flex min-h-screen bg-background">
        <ConsoleSidebar role={user.role} unreadCount={unreadCount} />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </NotificationCountProvider>
  );
}
