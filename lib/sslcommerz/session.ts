import { getSslCommerzConfig } from "./config";

export type SslCommerzCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type SslCommerzSessionInput = {
  orderId: string;
  totalAmount: number;
  customer: SslCommerzCustomer;
  productName: string;
};

export type SslCommerzSessionResult =
  | { ok: true; gatewayPageUrl: string }
  | { ok: false; message: string };

/**
 * Creates an SSLCommerz hosted checkout session (sandbox testbox/qwerty by default).
 * Mirrors care-connect-hub/src/lib/sslcommerz.ts — server-side call to the gateway.
 */
export async function createSslCommerzSession(
  input: SslCommerzSessionInput
): Promise<SslCommerzSessionResult> {
  const config = getSslCommerzConfig();
  const amount = input.totalAmount.toFixed(2);
  const oid = encodeURIComponent(input.orderId);
  const bridge = `${config.appUrl}/api/payments/sslcommerz/bridge`;

  const body = new URLSearchParams();
  body.set("store_id", config.storeId);
  body.set("store_passwd", config.storePassword);
  body.set("total_amount", amount);
  body.set("currency", "BDT");
  body.set("tran_id", input.orderId);
  body.set("success_url", `${bridge}?outcome=success&oid=${oid}`);
  body.set("fail_url", `${bridge}?outcome=fail&oid=${oid}`);
  body.set("cancel_url", `${bridge}?outcome=cancel&oid=${oid}`);
  body.set("ipn_url", `${config.appUrl}/api/payments/sslcommerz/ipn`);
  body.set("product_category", "Ecommerce");
  body.set("product_name", input.productName.slice(0, 255));
  body.set("product_profile", "general");
  body.set("shipping_method", "NO");
  body.set("cus_name", input.customer.name.slice(0, 50));
  body.set("cus_email", input.customer.email.slice(0, 50));
  body.set("cus_add1", input.customer.address.slice(0, 50) || "Dhaka");
  body.set("cus_city", input.customer.city.slice(0, 50) || "Dhaka");
  body.set("cus_state", input.customer.state.slice(0, 50) || "Dhaka");
  body.set("cus_postcode", input.customer.postcode.slice(0, 30) || "1000");
  body.set("cus_country", input.customer.country || "Bangladesh");
  body.set(
    "cus_phone",
    input.customer.phone.replace(/\D/g, "").slice(0, 20) || "01700000000"
  );
  body.set("value_a", input.orderId);

  const response = await fetch(config.sessionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await response.text();
  let data: {
    status?: string;
    failedreason?: string;
    GatewayPageURL?: string;
  };

  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    return { ok: false, message: "Invalid response from payment gateway" };
  }

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    return {
      ok: false,
      message: data.failedreason || data.status || "Could not start payment",
    };
  }

  return { ok: true, gatewayPageUrl: data.GatewayPageURL };
}

export async function validateSslCommerzPayment(
  valId: string,
  tranId?: string
) {
  const config = getSslCommerzConfig();

  const url = new URL(config.validationUrl);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", config.storeId);
  url.searchParams.set("store_passwd", config.storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());
  const data = (await response.json()) as {
    status?: string;
    tran_id?: string;
    val_id?: string;
  };

  if (data.status !== "VALID" && data.status !== "VALIDATED") {
    return null;
  }

  if (tranId && data.tran_id && data.tran_id !== tranId) {
    return null;
  }

  return data;
}

export function readOrderIdFromCallback(
  params: URLSearchParams,
  fallbackOrderId?: string | null
): string | null {
  return (
    params.get("oid") ||
    params.get("value_a") ||
    params.get("Value_A") ||
    params.get("tran_id") ||
    fallbackOrderId ||
    null
  );
}

export function isPaymentStatusValid(status: string | null): boolean {
  const normalized = (status ?? "").toUpperCase();
  return !normalized || normalized === "VALID" || normalized === "VALIDATED";
}
