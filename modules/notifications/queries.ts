import { getDb } from "@/lib/supabase/db";
import { mapNotification } from "@/lib/supabase/mappers";
import type { Notification } from "@/lib/types/database";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const db = getDb();
  const { count, error } = await db
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

export async function getNotificationsForUser(
  userId: string,
  options: { limit?: number } = {}
): Promise<Notification[]> {
  const db = getDb();
  const limit = options.limit ?? 50;

  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapNotification);
}
