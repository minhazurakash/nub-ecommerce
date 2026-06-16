import { DiscountType } from "@/lib/types/database";

export const SHIPPING_FLAT_RATE = 9.99;
export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 75;

export function calculateCouponDiscount(
  subtotal: number,
  discountType: DiscountType,
  amount: number
): number {
  if (discountType === DiscountType.PERCENTAGE) {
    return Math.min(subtotal, subtotal * (amount / 100));
  }
  return Math.min(subtotal, amount);
}

export function calculateOrderTotals(subtotal: number, discount = 0) {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shipping + tax;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    shipping,
    tax,
    total,
  };
}
