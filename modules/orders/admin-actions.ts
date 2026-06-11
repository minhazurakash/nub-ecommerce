"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { requireAdmin } from "@/modules/auth/actions";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;

  if (!orderId || !status) return;

  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status)) return;

  const db = getDb();
  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;

  revalidatePath("/console/orders");
  revalidatePath(`/console/orders/${orderId}`);
}
