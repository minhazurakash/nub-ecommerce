import type { Address, Order, User } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { mapAddress, mapUser } from "@/lib/supabase/mappers";
import { getOrdersForUser, type OrderListItem } from "@/modules/orders/queries";

export type UserProfile = Pick<
  User,
  "id" | "email" | "name" | "phone" | "avatarUrl" | "role" | "createdAt"
>;

export type AccountStats = {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  addressCount: number;
  wishlistCount: number;
  memberSince: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getDb();
  const { data } = await db.from("users").select("*").eq("id", userId).maybeSingle();
  if (!data) return null;
  const user = mapUser(data);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  const db = getDb();
  const { data } = await db
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapAddress);
}

export async function getUserOrders(userId: string): Promise<OrderListItem[]> {
  return getOrdersForUser(userId);
}

export async function getAccountStats(userId: string): Promise<AccountStats | null> {
  const db = getDb();
  const { data: user } = await db
    .from("users")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  if (!user) return null;

  const { data: orders } = await db
    .from("orders")
    .select("total, status")
    .eq("user_id", userId);

  const { count: addressCount } = await db
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: wishlistCount } = await db
    .from("wishlist_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const orderList = orders ?? [];
  const totalSpent = orderList.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orderList.filter(
    (o) => o.status === "PENDING" || o.status === "SHIPPED"
  ).length;

  return {
    totalOrders: orderList.length,
    totalSpent,
    pendingOrders,
    addressCount: addressCount ?? 0,
    wishlistCount: wishlistCount ?? 0,
    memberSince: user.created_at,
  };
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const db = getDb();
  const { data } = await db
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  return data ? mapAddress(data) : null;
}

export type RecentOrderSummary = Pick<
  Order,
  "id" | "orderNumber" | "status" | "total" | "placedAt"
>;

export async function getRecentOrders(
  userId: string,
  limit = 5
): Promise<RecentOrderSummary[]> {
  const db = getDb();
  const { data } = await db
    .from("orders")
    .select("id, order_number, status, total, placed_at")
    .eq("user_id", userId)
    .order("placed_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    total: Number(row.total),
    placedAt: row.placed_at,
  }));
}
