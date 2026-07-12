import { getDb } from "@/lib/supabase/db";
import {
  NotificationType,
  OrderStatus,
  Role,
  type Order,
} from "@/lib/types/database";

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.AWAITING_PAYMENT:
      return "Awaiting payment";
    case OrderStatus.SHIPPED:
      return "Shipped";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
}

export async function notifyAdminsOfNewOrder(order: {
  id: string;
  orderNumber: string;
}): Promise<void> {
  const db = getDb();
  const { data: admins } = await db
    .from("users")
    .select("id")
    .eq("role", Role.ADMIN);

  if (!admins?.length) return;

  await db.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      type: NotificationType.ORDER_PLACED,
      title: "New order placed",
      body: `Order ${order.orderNumber} was placed and needs attention.`,
      link: `/console/orders/${order.id}`,
      order_id: order.id,
      is_read: false,
    }))
  );
}

export async function notifyCustomerOfOrderStatus(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}): Promise<void> {
  const { userId, orderId, orderNumber, previousStatus, newStatus } = params;
  if (previousStatus === newStatus) return;

  const db = getDb();
  await db.from("notifications").insert({
    user_id: userId,
    type: NotificationType.ORDER_STATUS,
    title: "Order status updated",
    body: `Order ${orderNumber} is now ${statusLabel(newStatus)} (was ${statusLabel(previousStatus)}).`,
    link: `/account/orders/${orderId}`,
    order_id: orderId,
    is_read: false,
  });
}

export async function notifyCustomerOrderCancelled(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  previousStatus: OrderStatus;
}): Promise<void> {
  await notifyCustomerOfOrderStatus({
    ...params,
    newStatus: OrderStatus.CANCELLED,
  });
}

/** Convenience when you already have a mapped Order */
export async function notifyFromOrderStatusChange(
  order: Pick<Order, "id" | "userId" | "orderNumber">,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<void> {
  await notifyCustomerOfOrderStatus({
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    previousStatus,
    newStatus,
  });
}
