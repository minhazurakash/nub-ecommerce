"use client";

import { OrderStatus } from "@/lib/types/database";
import { OrderStatusSelect } from "@/components/console/order-status-select";

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  return (
    <OrderStatusSelect
      orderId={orderId}
      currentStatus={currentStatus}
      showLabel
    />
  );
}
