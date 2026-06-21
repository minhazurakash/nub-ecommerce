import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  placedAt: Date | string;
  total: number | string;
  itemCount: number;
};

type OrderCardProps = {
  order: OrderSummary;
  href?: string;
  className?: string;
};

export function OrderCard({ order, href, className }: OrderCardProps) {
  const placedAt =
    typeof order.placedAt === "string"
      ? new Date(order.placedAt)
      : order.placedAt;
  const detailHref = href ?? `/account/orders/${order.id}`;

  return (
    <Card className={cn("transition-colors hover:bg-muted/30", className)}>
      <Link href={detailHref} className="block">
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="break-all text-base sm:break-normal">
              {order.orderNumber}
            </CardTitle>
            <CardDescription>
              Placed {format(placedAt, "MMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:max-w-[11rem] sm:flex-col sm:items-end">
            <OrderStatusBadge status={order.status} />
            {order.paymentStatus ? (
              <PaymentStatusBadge
                status={order.paymentStatus}
                paymentMethod={order.paymentMethod}
              />
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Package className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span className="font-medium text-foreground">
              {formatPrice(order.total)}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Link>
    </Card>
  );
}
