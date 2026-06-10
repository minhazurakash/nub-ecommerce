import { OrderStatus } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
export async function getDashboardStats() {
  const db = getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: orders },
    { data: recentOrders },
  ] = await Promise.all([
    db.from("products").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("users").select("*", { count: "exact", head: true }),
    db
      .from("orders")
      .select("total, status, placed_at")
      .neq("status", OrderStatus.CANCELLED),
    db
      .from("orders")
      .select("*, users(name, email)")
      .order("placed_at", { ascending: false })
      .limit(10),
  ]);

  const totalRevenue = (orders ?? [])
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const statusCounts = new Map<string, number>();
  for (const o of orders ?? []) {
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  }

  const chartOrders = (orders ?? []).filter(
    (o) => new Date(o.placed_at) >= thirtyDaysAgo
  );

  const revenueByDate = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    revenueByDate.set(
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      0
    );
  }

  for (const order of chartOrders) {
    const key = new Date(order.placed_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (revenueByDate.has(key)) {
      revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + Number(order.total));
    }
  }

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    userCount: userCount ?? 0,
    totalRevenue,
    revenueData: Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    })),
    statusChartData: Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    recentOrders: (recentOrders ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      total: Number(row.total),
      placedAt: row.placed_at,
      user: {
        name: row.users?.name ?? null,
        email: row.users?.email ?? "",
      },
    })),
  };
}
