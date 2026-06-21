"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PENDING_ORDER_SESSION_KEY } from "@/lib/sslcommerz/config";
import {
  isPaymentStatusValid,
  readOrderIdFromCallback,
} from "@/lib/sslcommerz/session";
import {
  cancelSslCommerzOrder,
  confirmSslCommerzPayment,
} from "@/modules/orders/payment-actions";

type PaymentOutcome = "success" | "fail" | "cancel";

const VALID_OUTCOMES = new Set<string>(["success", "fail", "cancel"]);

interface PaymentResultClientProps {
  outcome: string;
  searchParams: Record<string, string | string[] | undefined>;
}

function param(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function PaymentResultClient({
  outcome,
  searchParams,
}: PaymentResultClientProps) {
  const router = useRouter();
  const normalized = outcome.toLowerCase();
  const invalid = !VALID_OUTCOMES.has(normalized);
  const kind = (invalid ? "fail" : normalized) as PaymentOutcome;

  const [settled, setSettled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invalid) return;

    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") params.set(key, value);
      else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
    });

    const fallbackOrderId = sessionStorage.getItem(PENDING_ORDER_SESSION_KEY);
    const orderId = readOrderIdFromCallback(params, fallbackOrderId);
    const valId = param(searchParams, "val_id");
    const status = param(searchParams, "status");

    (async () => {
      if (kind === "success") {
        if (!orderId) {
          sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);
          setError(
            "Missing order reference after payment. Check My Orders if you were charged."
          );
          setSettled(true);
          return;
        }

        if (!isPaymentStatusValid(status)) {
          sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);
          setError("Payment was not completed successfully.");
          setSettled(true);
          return;
        }

        if (!valId) {
          sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);
          setError("Payment validation data missing. Please contact support.");
          setSettled(true);
          return;
        }

        const result = await confirmSslCommerzPayment(orderId, valId);
        sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);

        if (!result.success || !result.orderNumber) {
          setError(result.error ?? "Could not confirm payment.");
          setSettled(true);
          return;
        }

        router.replace(
          `/checkout/success?orderNumber=${encodeURIComponent(result.orderNumber)}`
        );
        return;
      }

      if ((kind === "fail" || kind === "cancel") && orderId) {
        await cancelSslCommerzOrder(orderId);
      }
      sessionStorage.removeItem(PENDING_ORDER_SESSION_KEY);
      setSettled(true);
    })();
  }, [invalid, kind, router, searchParams]);

  if (invalid) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="py-12">
          <p className="text-muted-foreground">Invalid payment result.</p>
          <Button asChild className="mt-4">
            <Link href="/checkout">Back to checkout</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (kind === "success" && !settled && !error) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="flex flex-col items-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Confirming your payment…
          </p>
        </CardContent>
      </Card>
    );
  }

  const title = error
    ? "Could not finish payment"
    : kind === "cancel"
      ? "Payment cancelled"
      : "Payment failed";

  const description = error
    ? error
    : kind === "cancel"
      ? "No charge was made. Your cart is unchanged — you can try again."
      : "We could not complete the payment. You can try again or choose Cash on Delivery.";

  const Icon =
    error || kind === "fail" ? XCircle : kind === "cancel" ? Ban : CheckCircle;

  const iconClass =
    error || kind === "fail"
      ? "text-destructive"
      : kind === "cancel"
        ? "text-amber-500"
        : "text-green-600";

  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader className="items-center">
        <Icon className={`h-14 w-14 ${iconClass}`} />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/checkout">Back to checkout</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
