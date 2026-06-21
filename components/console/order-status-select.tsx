"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "@/lib/types/database";
import { updateOrderStatus } from "@/modules/orders/admin-actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.AWAITING_PAYMENT, label: "Awaiting Payment" },
  { value: OrderStatus.SHIPPED, label: "Shipped" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: OrderStatus;
  showLabel?: boolean;
  className?: string;
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
  showLabel = false,
  className,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: OrderStatus) {
    if (status === currentStatus) return;

    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", status);

    startTransition(async () => {
      try {
        const result = await updateOrderStatus(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        const label =
          STATUS_OPTIONS.find((option) => option.value === status)?.label ??
          status;
        toast.success(`Order updated to ${label}`);
      } catch {
        toast.error("Failed to update order status");
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel ? (
        <Label htmlFor={`order-status-${orderId}`} className="shrink-0">
          Status
        </Label>
      ) : null}
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusChange(value as OrderStatus)}
        disabled={isPending}
      >
        <SelectTrigger
          id={`order-status-${orderId}`}
          className={cn(showLabel ? "w-44" : "h-8 w-[8.5rem]")}
        >
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
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
