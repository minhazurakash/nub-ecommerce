import { getDb } from "@/lib/supabase/db";

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
