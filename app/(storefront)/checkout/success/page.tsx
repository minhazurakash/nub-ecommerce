import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="container-custom py-16">
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader className="items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="font-[family-name:var(--font-poppins)] text-2xl">
            Order Confirmed!
          </CardTitle>
          <CardDescription className="text-base">
            Thank you for your purchase. We&apos;ve received your order and will
            begin processing it shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderNumber && (
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">Order number</p>
              <p className="font-mono text-lg font-semibold">{orderNumber}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>You&apos;ll receive a confirmation email soon</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
