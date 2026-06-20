import type { Coupon } from "@/lib/types/database";

type CouponSchedule = Pick<
  Coupon,
  "isActive" | "validFrom" | "validUntil" | "maxUses" | "usedCount"
>;

/** Same validity rules as checkout `validateCoupon` (without min-order check). */
export function isCouponActive(
  coupon: CouponSchedule,
  now = new Date()
): boolean {
  if (!coupon.isActive) return false;
  if (now < new Date(coupon.validFrom)) return false;
  if (now > new Date(coupon.validUntil)) return false;
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return false;
  return true;
}
