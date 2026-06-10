import Link from "next/link";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { requireAdmin } from "@/modules/auth/actions";
import { getDashboardStats } from "@/modules/dashboard/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { StatCard } from "@/components/console/stat-card";
import { RevenueChart } from "@/components/console/revenue-chart";
import { OrderStatusChart } from "@/components/console/order-status-chart";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ConsoleDashboardPage() {
  const user = await requireAdmin();
  const stats = await getDashboardStats();

  return (
    <>
      <ConsoleHeader
        title="Dashboard"
        description="Overview of your store performance"
        user={user}
      />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Products" value={stats.productCount} icon={Package} />
          <StatCard label="Orders" value={stats.orderCount} icon={ShoppingCart} />
          <StatCard label="Users" value={stats.userCount} icon={Users} />
          <StatCard
            label="Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={stats.revenueData} />
          <OrderStatusChart data={stats.statusChartData} />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Recent Orders</h2>
            <Link
              href="/console/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentOrders.map((order) => (
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
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
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
