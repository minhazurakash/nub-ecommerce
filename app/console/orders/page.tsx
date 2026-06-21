import Link from "next/link";
import { requireAdmin } from "@/modules/auth/actions";
import { getAllOrders } from "@/modules/orders/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { OrderStatusSelect } from "@/components/console/order-status-select";
import { PaymentStatusBadge } from "@/components/account/payment-status-badge";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/payment-labels";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ConsoleOrdersPage() {
  const user = await requireAdmin();
  const { orders } = await getAllOrders({ limit: 100 });

  return (
    <>
      <ConsoleHeader
        title="Orders"
        description="View and manage customer orders"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/console/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {order.user.name ?? order.user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items.length}
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {paymentMethodLabel(order.paymentMethod)}
                        </p>
                        <PaymentStatusBadge
                          status={order.paymentStatus}
                          paymentMethod={order.paymentMethod}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.placedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/console/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
