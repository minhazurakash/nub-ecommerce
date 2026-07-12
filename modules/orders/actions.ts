"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/supabase/db";
import {
  mapAddress,
  mapProduct,
  mapProductImage,
  mapProductVariant,
} from "@/lib/supabase/mappers";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  type ProductVariant,
} from "@/lib/types/database";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/lib/validations/checkout";
import { calculateOrderTotals } from "@/lib/pricing";
import { resolveAppUrl } from "@/lib/app-url";
import { createSslCommerzSession } from "@/lib/sslcommerz/session";
import { requireUser } from "@/modules/auth/actions";
import { toAddressInsert } from "@/lib/supabase/mappers";
import {
  incrementCouponUsage,
  resolveCouponForOrder,
} from "@/modules/coupons/actions";
import { decrementStockForOrderItems } from "@/modules/orders/stock";
import { notifyAdminsOfNewOrder } from "@/modules/notifications/create";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function getEffectivePrice(price: number, discountPrice: number | null): number {
  return discountPrice ?? price;
}

export async function createOrder(
  input: CheckoutFormInput
): Promise<
  ActionResult<{
    orderId: string;
    orderNumber: string;
    gatewayUrl?: string;
  }>
> {
  const user = await requireUser();

  const parsed = checkoutFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid checkout data",
    };
  }

  const {
    items,
    addressId,
    address,
    saveAddress,
    couponCode,
    notes,
    paymentMethod,
  } = parsed.data;

  const db = getDb();

  try {
    let shippingAddress: Record<string, string>;

    if (addressId) {
      const { data: saved } = await db
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!saved) throw new Error("Selected address not found");
      const a = mapAddress(saved);
      shippingAddress = {
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? "",
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
      };
    } else if (address) {
      shippingAddress = {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };

      if (saveAddress) {
        if (address.isDefault) {
          await db
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)
            .eq("is_default", true);
        }
        await db.from("addresses").insert(toAddressInsert(user.id, address));
      }
    } else {
      throw new Error("Shipping address is required");
    }

    const productIds = items.map((i) => i.productId);
    const { data: productRows } = await db
      .from("products")
      .select("*, product_images(url, sort_order), product_variants(*)")
      .in("id", productIds);

    const productMap = new Map(
      (productRows ?? []).map((row) => {
        const p = mapProduct(row);
        const images = (row.product_images ?? []).map(mapProductImage);
        const variants = (row.product_variants ?? []).map(mapProductVariant);
        return [p.id, { ...p, images, variants }] as const;
      })
    );

    let subtotal = 0;
    const orderItems: {
      product_id: string;
      quantity: number;
      unit_price: number;
      product_title: string;
      product_image: string | null;
      variant_snapshot: Record<string, unknown> | null;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      let unitPrice = getEffectivePrice(product.price, product.discountPrice);
      let variantSnapshot: Record<string, unknown> | null = null;

      const resolvedVariantId =
        item.variantId ??
        (product.variants.length > 0
          ? product.variants.find((v: ProductVariant) => v.stock >= item.quantity)
              ?.id ?? product.variants[0]?.id
          : undefined);

      if (resolvedVariantId) {
        const variant = product.variants.find(
          (v: ProductVariant) => v.id === resolvedVariantId
        );
        if (!variant) throw new Error(`Variant not found for ${product.title}`);
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }
        unitPrice += variant.priceDelta;
        variantSnapshot = {
          id: variant.id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          sku: variant.sku,
        };
      } else if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }

      subtotal += unitPrice * item.quantity;
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        product_title: product.title,
        product_image: product.images[0]?.url ?? null,
        variant_snapshot: variantSnapshot,
      });
    }

    const { coupon, discount } = await resolveCouponForOrder(
      couponCode,
      subtotal
    );
    const totals = calculateOrderTotals(subtotal, discount);
    const orderNumber = generateOrderNumber();
    const isCod = paymentMethod === PaymentMethod.COD;

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: isCod ? OrderStatus.PENDING : OrderStatus.AWAITING_PAYMENT,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        coupon_id: coupon?.id ?? null,
        coupon_code: coupon?.code ?? null,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: PaymentStatus.PENDING,
        notes: notes ?? null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Order failed");
    }

    await db.from("order_items").insert(
      orderItems.map((item) => ({ ...item, order_id: order.id }))
    );

    if (isCod) {
      await decrementStockForOrderItems(orderItems);
      if (coupon) {
        await incrementCouponUsage(coupon.id);
      }
      await notifyAdminsOfNewOrder({
        id: order.id,
        orderNumber: order.order_number,
      });
    }

    await db
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .in("product_id", productIds);

    revalidatePath("/account");
    revalidatePath("/account/orders");
    revalidatePath("/cart");
    revalidatePath("/console");
    revalidatePath("/console/orders");
    revalidatePath("/console/notifications");

    let gatewayUrl: string | undefined;

    if (!isCod) {
      const appUrl = await resolveAppUrl();
      const pay = await createSslCommerzSession({
        orderId: order.id,
        totalAmount: totals.total,
        appUrl,
        customer: {
          name: shippingAddress.fullName,
          email: user.email,
          phone: shippingAddress.phone,
          address: shippingAddress.line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postcode: shippingAddress.postalCode,
          country: shippingAddress.country || "Bangladesh",
        },
        productName: orderItems.map((i) => i.product_title).join(", "),
      });

      if (!pay.ok) {
        await db
          .from("orders")
          .update({ status: OrderStatus.CANCELLED })
          .eq("id", order.id);
        throw new Error(pay.message);
      }

      gatewayUrl = pay.gatewayPageUrl;
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        gatewayUrl,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return { success: false, error: message };
  }
}
