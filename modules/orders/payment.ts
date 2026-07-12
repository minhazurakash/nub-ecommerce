import { getDb } from "@/lib/supabase/db";
import { mapOrder } from "@/lib/supabase/mappers";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types/database";
import { incrementCouponUsage } from "@/modules/coupons/actions";
import {
  notifyAdminsOfNewOrder,
  notifyCustomerOrderCancelled,
} from "@/modules/notifications/create";
import { decrementStockForOrder } from "@/modules/orders/stock";
import { validateSslCommerzPayment } from "@/lib/sslcommerz/session";

export async function confirmSslCommerzPayment(
  tranId: string,
  valId: string
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  const db = getDb();

  const { data: orderRow } = await db
    .from("orders")
    .select("*")
    .eq("id", tranId)
    .maybeSingle();

  if (!orderRow) {
    return { success: false, error: "Order not found" };
  }

  const order = mapOrder(orderRow);

  if (order.paymentMethod !== PaymentMethod.SSLCOMMERZ) {
    return { success: false, error: "Invalid payment method" };
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return { success: true, orderNumber: order.orderNumber };
  }

  const validation = await validateSslCommerzPayment(valId, tranId);
  if (
    !validation ||
    (validation.tran_id && validation.tran_id !== tranId)
  ) {
    await db
      .from("orders")
      .update({
        payment_status: PaymentStatus.FAILED,
        status: OrderStatus.CANCELLED,
      })
      .eq("id", tranId);

    if (order.status !== OrderStatus.CANCELLED) {
      await notifyCustomerOrderCancelled({
        userId: order.userId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
      });
    }

    return { success: false, error: "Payment validation failed" };
  }

  await decrementStockForOrder(tranId);

  await db
    .from("orders")
    .update({
      payment_status: PaymentStatus.PAID,
      payment_transaction_id: valId,
      status: OrderStatus.PENDING,
    })
    .eq("id", tranId);

  if (order.couponId) {
    await incrementCouponUsage(order.couponId);
  }

  await notifyAdminsOfNewOrder({
    id: order.id,
    orderNumber: order.orderNumber,
  });

  return { success: true, orderNumber: order.orderNumber };
}

export async function cancelSslCommerzOrder(tranId: string) {
  const db = getDb();
  const { data: orderRow } = await db
    .from("orders")
    .select("*")
    .eq("id", tranId)
    .maybeSingle();

  if (!orderRow) return;
  const order = mapOrder(orderRow);
  if (order.paymentMethod !== PaymentMethod.SSLCOMMERZ) return;
  if (order.paymentStatus === PaymentStatus.PAID) return;
  if (order.status === OrderStatus.CANCELLED) return;

  await db
    .from("orders")
    .update({
      payment_status: PaymentStatus.FAILED,
      status: OrderStatus.CANCELLED,
    })
    .eq("id", tranId);

  await notifyCustomerOrderCancelled({
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    previousStatus: order.status,
  });
}
