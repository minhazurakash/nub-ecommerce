"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { mapOrder } from "@/lib/supabase/mappers";
import { requireAdmin } from "@/modules/auth/actions";
import { notifyFromOrderStatusChange } from "@/modules/notifications/create";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) {
    return { success: false as const, error: "Invalid order update request." };
  }

  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status)) {
    return { success: false as const, error: "Invalid order status." };
  }

  const db = getDb();
  const { data: existingRow } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!existingRow) {
    return { success: false as const, error: "Order not found." };
  }

  const existing = mapOrder(existingRow);
  if (existing.status === status) {
    return { success: true as const };
  }

  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    return { success: false as const, error: error.message };
  }

  await notifyFromOrderStatusChange(existing, existing.status, status);

  revalidatePath("/console");
  revalidatePath("/console/orders");
  revalidatePath(`/console/orders/${orderId}`);
  revalidatePath("/console/notifications");
  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/notifications");

  return { success: true as const };
}
