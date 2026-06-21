"use client";

import { useMemo, useState } from "react";
import { OrderStatus } from "@/lib/types/database";
import { OrderCard } from "@/components/account/order-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderListItem } from "@/modules/orders/queries";

type FilterTab = "all" | OrderStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.AWAITING_PAYMENT, label: "Awaiting Payment" },
  { value: OrderStatus.SHIPPED, label: "Shipped" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

type OrdersFilterListProps = {
  orders: OrderListItem[];
};

export function OrdersFilterList({ orders }: OrdersFilterListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight sm:text-2xl">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          View and track your order history
        </p>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterTab)}>
        <div className="-mx-1 overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-1 p-1 sm:min-w-0 sm:flex-wrap">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center sm:p-12">
          <p className="text-muted-foreground">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter.toLowerCase()} orders found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                placedAt: order.placedAt,
                total: Number(order.total),
                itemCount: order.items.length,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
