import { getDb } from "@/lib/supabase/db";
import { mapCoupon } from "@/lib/supabase/mappers";
import type { Coupon } from "@/lib/types/database";

export async function getCoupons(): Promise<Coupon[]> {
  const db = getDb();
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCoupon);
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const db = getDb();
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCoupon(data) : null;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const db = getDb();
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data ? mapCoupon(data) : null;
}
