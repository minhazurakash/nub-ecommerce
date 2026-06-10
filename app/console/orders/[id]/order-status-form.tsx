"use client";

import { useTransition } from "react";
import { OrderStatus } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/modules/orders/admin-actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.SHIPPED, label: "Shipped" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: OrderStatus) {
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", status);
    startTransition(() => {
      updateOrderStatus(formData);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="order-status" className="shrink-0">
        Status
      </Label>
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusChange(value as OrderStatus)}
        disabled={isPending}
      >
        <SelectTrigger id="order-status" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
