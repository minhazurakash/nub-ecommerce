import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatus } from "@/lib/types/database";
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

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
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
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{order.orderNumber}</CardTitle>
            <CardDescription>
              Placed {format(placedAt, "MMM d, yyyy")}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </span>
            <span aria-hidden>·</span>
            <span className="font-medium text-foreground">
              {formatPrice(order.total)}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Link>
    </Card>
  );
}
