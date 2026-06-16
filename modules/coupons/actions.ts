"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
import { formatDbError } from "@/lib/supabase/errors";
import { calculateCouponDiscount } from "@/lib/pricing";
import { couponFormSchema } from "@/lib/validations/coupon";
import { requireRoleAdmin } from "@/modules/auth/actions";
import { getCouponByCode } from "@/modules/coupons/queries";

export type CouponFormState = {
  error?: string;
};

export async function saveCoupon(
  _prevState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireRoleAdmin();

  const id = formData.get("id") as string | null;
  const raw = {
    code: (formData.get("code") as string)?.trim(),
    discountType: formData.get("discountType") as string,
    amount: formData.get("amount"),
    validFrom: formData.get("validFrom") as string,
    validUntil: formData.get("validUntil") as string,
    isActive: formData.get("isActive") === "on",
    maxUses: (formData.get("maxUses") as string)?.trim() || null,
    minOrderAmount: formData.get("minOrderAmount") ?? "0",
  };

  const parsed = couponFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? "Invalid coupon data",
    };
  }

  const data = parsed.data;
  const db = getDb();
  const payload = {
    code: data.code.toUpperCase(),
    discount_type: data.discountType,
    amount: data.amount,
    valid_from: new Date(data.validFrom).toISOString(),
    valid_until: new Date(data.validUntil).toISOString(),
    is_active: data.isActive,
    max_uses: data.maxUses ?? null,
    min_order_amount: data.minOrderAmount,
  };

  try {
    if (id) {
      const { error } = await db.from("coupons").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("coupons").insert(payload);
      if (error) throw error;
    }
  } catch (error) {
    return {
      error: formatDbError(error, "Failed to save coupon. Code may already exist."),
    };
  }

  revalidatePath("/console/coupons");
  redirect("/console/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requireRoleAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();

  const { count } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", id);

  if (count && count > 0) {
    redirect("/console/coupons?error=in-use");
  }

  try {
    const { error } = await db.from("coupons").delete().eq("id", id);
    if (error) throw error;
  } catch {
    redirect("/console/coupons?error=delete-failed");
  }

  revalidatePath("/console/coupons");
  redirect("/console/coupons");
}

type ValidateCouponResult =
  | {
      success: true;
      data: {
        code: string;
        discountType: string;
        amount: number;
        discount: number;
      };
    }
  | { success: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ValidateCouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Please enter a coupon code" };
  }

  const coupon = await getCouponByCode(normalized);
  if (!coupon) {
    return { success: false, error: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
    return { success: false, error: "This coupon is no longer active" };
  }

  const now = new Date();
  if (now < new Date(coupon.validFrom)) {
    return { success: false, error: "This coupon is not valid yet" };
  }
  if (now > new Date(coupon.validUntil)) {
    return { success: false, error: "This coupon has expired" };
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { success: false, error: "This coupon has reached its usage limit" };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      success: false,
      error: `Minimum order of $${coupon.minOrderAmount.toFixed(2)} required`,
    };
  }

  const discount = calculateCouponDiscount(
    subtotal,
    coupon.discountType,
    coupon.amount
  );

  return {
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      amount: coupon.amount,
      discount,
    },
  };
}

export async function resolveCouponForOrder(
  code: string | undefined,
  subtotal: number
) {
  if (!code?.trim()) {
    return { coupon: null, discount: 0 };
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.success) {
    throw new Error(result.error);
  }

  const coupon = await getCouponByCode(result.data.code);
  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  return { coupon, discount: result.data.discount };
}

export async function incrementCouponUsage(couponId: string) {
  const db = getDb();
  const { data: row } = await db
    .from("coupons")
    .select("used_count")
    .eq("id", couponId)
    .single();

  if (!row) return;

  await db
    .from("coupons")
    .update({ used_count: (row.used_count ?? 0) + 1 })
    .eq("id", couponId);
}
