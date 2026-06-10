import { getDb } from "@/lib/supabase/db";
import { mapUser } from "@/lib/supabase/mappers";

export async function getAllUsers() {
  const db = getDb();
  const { data } = await db
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (data ?? []).map(mapUser);
  const result = [];

  for (const user of users) {
    const { count } = await db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    result.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      _count: { orders: count ?? 0 },
    });
  }

  return result;
}
