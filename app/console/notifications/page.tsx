import { requireRoleAdmin } from "@/modules/auth/actions";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/modules/notifications/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function ConsoleNotificationsPage() {
  const user = await requireRoleAdmin();
  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(user.id, { limit: 100 }),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <>
      <ConsoleHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Order alerts and updates"
        }
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <NotificationList
          notifications={notifications}
          emptyMessage="No order notifications yet."
        />
      </div>
    </>
  );
}
