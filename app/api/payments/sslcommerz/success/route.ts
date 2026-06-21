import { NextRequest, NextResponse } from "next/server";
import { confirmSslCommerzPayment } from "@/modules/orders/payment";
import { readOrderIdFromCallback } from "@/lib/sslcommerz/session";

/** Legacy direct callback — redirects through payment result flow. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const orderId = readOrderIdFromCallback(params);
  const valId = params.get("val_id") ?? "";

  if (!orderId || !valId) {
    return NextResponse.redirect(
      new URL("/checkout/payment/fail", request.url)
    );
  }

  const result = await confirmSslCommerzPayment(orderId, valId);

  if (!result.success || !result.orderNumber) {
    return NextResponse.redirect(
      new URL("/checkout/payment/fail", request.url)
    );
  }

  return NextResponse.redirect(
    new URL(
      `/checkout/success?orderNumber=${encodeURIComponent(result.orderNumber)}`,
      request.url
    )
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const params = new URLSearchParams();
  form.forEach((value, key) => params.set(key, String(value)));
  request.nextUrl.searchParams.forEach((value, key) => params.set(key, value));

  const target = new URL("/api/payments/sslcommerz/bridge", request.url);
  target.searchParams.set("outcome", "success");
  params.forEach((value, key) => target.searchParams.set(key, value));
  return NextResponse.redirect(target, { status: 302 });
}
