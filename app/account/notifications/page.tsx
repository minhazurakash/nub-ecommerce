import { requireUser } from "@/modules/auth/actions";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/modules/notifications/queries";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function AccountNotificationsPage() {
  const user = await requireUser();
  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(user.id, { limit: 100 }),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Updates about your orders"}
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
