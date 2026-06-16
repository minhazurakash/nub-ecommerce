import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { BuyAgainButton } from "@/components/account/buy-again-button";
import { OrderItemsTable } from "@/components/account/order-items-table";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTimeline } from "@/components/account/order-timeline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/modules/auth/actions";
import { getOrderById } from "@/modules/orders/queries";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

type ShippingAddress = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const order = await getOrderById(id, user.id);
  if (!order) notFound();

  const shippingAddress = order.shippingAddress as ShippingAddress;
  const addressLines = [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode]
      .filter(Boolean)
      .join(", "),
    shippingAddress.country,
  ].filter(Boolean);

  const buyAgainItems = order.items.map((item) => {
    const variant = item.variantSnapshot as {
      id?: string;
      size?: string | null;
      color?: string | null;
    } | null;

    return {
      productId: item.productId,
      title: item.productTitle,
      slug: item.product.slug,
      image: item.productImage ?? item.product.images[0]?.url ?? "",
      price: Number(item.unitPrice),
      quantity: item.quantity,
      variantId: variant?.id,
      size: variant?.size,
      color: variant?.color,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {format(order.placedAt, "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <BuyAgainButton
          items={buyAgainItems}
          disabled={order.status === "CANCELLED"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
              <CardDescription>
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"} in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderItemsTable
                items={order.items.map((item) => ({
                  id: item.id,
                  productTitle: item.productTitle,
                  productImage: item.productImage,
                  variantSnapshot: item.variantSnapshot as {
                    size?: string | null;
                    color?: string | null;
                  } | null,
                  quantity: item.quantity,
                  unitPrice: Number(item.unitPrice),
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Discount
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span className="text-green-600">
                    -{formatPrice(Number(order.discount))}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(Number(order.shipping))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping address</CardTitle>
              {shippingAddress.label && (
                <CardDescription>{shippingAddress.label}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {shippingAddress.fullName && (
                <p className="font-medium text-foreground">
                  {shippingAddress.fullName}
                </p>
              )}
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
