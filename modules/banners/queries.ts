import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/supabase/db";
import { mapBanner } from "@/lib/supabase/mappers";
import type { Banner } from "@/lib/types/database";

export { BANNERS_CACHE_TAG } from "@/lib/banner-utils";

export async function getBanners(): Promise<Banner[]> {
  const db = getDb();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapBanner);
}

export async function getBannerById(id: string): Promise<Banner | null> {
  const db = getDb();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBanner(data) : null;
}

export async function getActiveBanners(): Promise<Banner[]> {
  noStore();

  const db = getDb();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map(mapBanner)
    .filter((banner) => {
      if (banner.startsAt && now < banner.startsAt) return false;
      if (banner.endsAt && now > banner.endsAt) return false;
      return true;
    });
}
