import { OrderStatus } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { mapOrder, mapOrderItem, mapUser } from "@/lib/supabase/mappers";

export type OrderListItem = ReturnType<typeof mapOrder> & {
  items: (ReturnType<typeof mapOrderItem> & {
    product: { id: string; slug: string };
  })[];
  user: { id: string; name: string | null; email: string };
};

export type OrderDetail = ReturnType<typeof mapOrder> & {
  items: (ReturnType<typeof mapOrderItem> & {
    product: {
      id: string;
      slug: string;
      title: string;
      images: { url: string }[];
    };
  })[];
  user: { id: string; name: string | null; email: string; phone: string | null };
};

export type AdminOrdersFilter = {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
};

export type PaginatedOrders = {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enrichOrderList(row: any): Promise<OrderListItem> {
  const db = getDb();
  const order = mapOrder(row);
  const user = mapUser(row.users ?? row.user);

  const { data: items } = await db
    .from("order_items")
    .select("*, products(id, slug)")
    .eq("order_id", order.id);

  return {
    ...order,
    user: { id: user.id, name: user.name, email: user.email },
    items: (items ?? []).map((item) => ({
      ...mapOrderItem(item),
      product: {
        id: item.products?.id ?? item.product_id,
        slug: item.products?.slug ?? "",
      },
    })),
  };
}

export async function getOrdersForUser(userId: string): Promise<OrderListItem[]> {
  const db = getDb();
  const { data } = await db
    .from("orders")
    .select("*, users(*)")
    .eq("user_id", userId)
    .order("placed_at", { ascending: false });

  return Promise.all((data ?? []).map(enrichOrderList));
}

export async function getOrderById(
  orderId: string,
  userId?: string
): Promise<OrderDetail | null> {
  const db = getDb();
  let query = db
    .from("orders")
    .select("*, users(*)")
    .eq("id", orderId);

  if (userId) query = query.eq("user_id", userId);

  const { data } = await query.maybeSingle();
  if (!data) return null;

  const order = mapOrder(data);
  const user = mapUser(data.users);

  const { data: items } = await db
    .from("order_items")
    .select("*, products(id, slug, title, product_images(url, sort_order))")
    .eq("order_id", order.id);

  return {
    ...order,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    items: (items ?? []).map((item) => ({
      ...mapOrderItem(item),
      product: {
        id: item.products?.id ?? item.product_id,
        slug: item.products?.slug ?? "",
        title: item.products?.title ?? item.product_title,
        images: (item.products?.product_images ?? [])
          .sort(
            (a: { sort_order: number }, b: { sort_order: number }) =>
              a.sort_order - b.sort_order
          )
          .slice(0, 1)
          .map((img: { url: string }) => ({ url: img.url })),
      },
    })),
  };
}

export async function getAllOrders(
  filters: AdminOrdersFilter = {}
): Promise<PaginatedOrders> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const db = getDb();

  let query = db
    .from("orders")
    .select("*, users(*)", { count: "exact" });

  if (filters.status) query = query.eq("status", filters.status);

  if (filters.search?.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`order_number.ilike.${s}`);
  }

  const { data, count } = await query
    .order("placed_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const orders = await Promise.all((data ?? []).map(enrichOrderList));

  return {
    orders,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit) || 1,
  };
}

export async function getOrderByNumber(
  orderNumber: string,
  userId?: string
): Promise<OrderDetail | null> {
  const db = getDb();
  let query = db
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber);

  if (userId) query = query.eq("user_id", userId);

  const { data } = await query.maybeSingle();
  if (!data) return null;
  return getOrderById(data.id, userId);
}
