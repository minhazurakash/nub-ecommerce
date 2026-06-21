import Link from "next/link";
import { format } from "date-fns";
import {
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { OrderCard } from "@/components/account/order-card";
import { StatCard } from "@/components/console/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { getAccountStats, getUserOrders } from "@/modules/account/queries";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function AccountDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [stats, allOrders] = await Promise.all([
    getAccountStats(user.id),
    getUserOrders(user.id),
  ]);

  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your account
          {stats?.memberSince
            ? ` · Member since ${format(stats.memberSince, "MMM yyyy")}`
            : ""}
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total orders"
            value={stats.totalOrders}
            icon={Package}
          />
          <StatCard
            label="Total spent"
            value={formatPrice(stats.totalSpent)}
            icon={Wallet}
          />
          <StatCard
            label="Pending orders"
            value={stats.pendingOrders}
            icon={ShoppingBag}
            description="Awaiting delivery"
          />
          <StatCard
            label="Saved addresses"
            value={stats.addressCount}
            icon={MapPin}
            description={`${stats.wishlistCount} wishlist items`}
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Recent orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
            <Link href="/account/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No orders yet. Start shopping to see your orders here.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/shop">Browse shop</Link>
              </Button>
            </div>
          ) : (
            recentOrders.map((order) => (
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
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" />
              Wishlist
            </CardTitle>
            <CardDescription>
              {stats?.wishlistCount ?? 0} saved items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/wishlist">View wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Addresses
            </CardTitle>
            <CardDescription>
              {stats?.addressCount ?? 0} saved addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/addresses">Manage addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
