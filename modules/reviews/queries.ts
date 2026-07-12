import { getDb } from "@/lib/supabase/db";

export async function getProductReviewCount(productId: string) {
  const db = getDb();
  const { count, error } = await db
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) return 0;
  return count ?? 0;
}

export async function getProductReviews(productId: string, limit = 20) {
  const db = getDb();
  const { data } = await db
    .from("reviews")
    .select("*, users(name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    userId: row.user_id as string,
    user: { name: row.users?.name ?? null },
  }));
}

export async function getUserReviewForProduct(
  userId: string,
  productId: string
) {
  const db = getDb();
  const { data } = await db
    .from("reviews")
    .select("*, users(name)")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    rating: data.rating,
    comment: data.comment,
    createdAt: data.created_at,
    userId: data.user_id as string,
    user: { name: data.users?.name ?? null },
  };
}

export async function userHasPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const db = getDb();
  const { data: orders } = await db
    .from("orders")
    .select("id")
    .eq("user_id", userId);

  if (!orders?.length) return false;

  const orderIds = orders.map((o) => o.id);
  const { count } = await db
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId)
    .in("order_id", orderIds);

  return (count ?? 0) > 0;
}

export async function recomputeProductRating(productId: string) {
  const db = getDb();
  const { data: reviews } = await db
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  const list = reviews ?? [];
  const reviewCount = list.length;
  const rating =
    reviewCount === 0
      ? 0
      : list.reduce((sum, r) => sum + Number(r.rating), 0) / reviewCount;

  await db
    .from("products")
    .update({
      rating: Math.round(rating * 10) / 10,
      review_count: reviewCount,
    })
    .eq("id", productId);

  return { rating, reviewCount };
}

export type AdminReviewFilters = {
  productId?: string;
  productQuery?: string;
  rating?: number;
  userQuery?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export async function getAdminReviews(filters: AdminReviewFilters = {}) {
  const db = getDb();
  let query = db
    .from("reviews")
    .select(
      "*, users(id, name, email), products(id, title, slug)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }
  if (filters.rating) {
    query = query.eq("rating", filters.rating);
  }
  if (filters.from) {
    query = query.gte("created_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("created_at", filters.to);
  }

  const { data, count, error } = await query;
  if (error || !data) {
    return { reviews: [], total: 0 };
  }

  let reviews = data.map((row) => ({
    id: row.id as string,
    rating: row.rating as number,
    comment: row.comment as string,
    createdAt: row.created_at as string,
    productId: row.product_id as string,
    userId: row.user_id as string,
    user: {
      id: (row.users as { id: string; name: string | null; email: string } | null)
        ?.id,
      name:
        (row.users as { name: string | null; email: string } | null)?.name ??
        null,
      email:
        (row.users as { name: string | null; email: string } | null)?.email ??
        "",
    },
    product: {
      id: (row.products as { id: string; title: string; slug: string } | null)
        ?.id,
      title:
        (row.products as { title: string; slug: string } | null)?.title ??
        "Unknown product",
      slug:
        (row.products as { title: string; slug: string } | null)?.slug ?? "",
    },
  }));

  const productQuery = filters.productQuery?.trim().toLowerCase();
  if (productQuery) {
    reviews = reviews.filter(
      (r) =>
        r.product.title.toLowerCase().includes(productQuery) ||
        r.product.slug.toLowerCase().includes(productQuery)
    );
  }

  const userQuery = filters.userQuery?.trim().toLowerCase();
  if (userQuery) {
    reviews = reviews.filter(
      (r) =>
        (r.user.name ?? "").toLowerCase().includes(userQuery) ||
        r.user.email.toLowerCase().includes(userQuery)
    );
  }

  return { reviews, total: count ?? reviews.length };
}
