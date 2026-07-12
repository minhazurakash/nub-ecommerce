"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/supabase/db";
import { requireUser } from "@/modules/auth/actions";

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();
  if (!notificationId) {
    return { success: false as const, error: "Invalid notification." };
  }

  const db = getDb();
  const { error } = await db
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/account/notifications");
  revalidatePath("/console");
  revalidatePath("/console/notifications");

  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const db = getDb();

  const { error } = await db
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/account/notifications");
  revalidatePath("/console");
  revalidatePath("/console/notifications");

  return { success: true as const };
}
