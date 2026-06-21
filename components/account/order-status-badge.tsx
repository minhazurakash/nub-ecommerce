import { OrderStatus } from "@/lib/types/database";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: NonNullable<BadgeProps["variant"]> }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  AWAITING_PAYMENT: { label: "Awaiting Payment", variant: "secondary" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
