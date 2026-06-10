import { getDb } from "@/lib/supabase/db";
import { mapBrand } from "@/lib/supabase/mappers";

export async function getBrands() {
  const db = getDb();
  const { data } = await db.from("brands").select("*").order("name", { ascending: true });
  return (data ?? []).map(mapBrand);
}
