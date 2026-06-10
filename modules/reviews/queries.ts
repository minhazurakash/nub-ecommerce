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
    user: { name: row.users?.name ?? null },
  }));
}
