import { NextRequest, NextResponse } from "next/server";

const OUTCOMES = new Set(["success", "fail", "cancel"]);

/**
 * SSLCommerz POSTs form data to return URLs. This bridge merges query + body
 * and redirects to the storefront payment result page (care-connect-hub pattern).
 */
async function handleBridge(request: NextRequest) {
  const url = request.nextUrl;
  const raw = (url.searchParams.get("outcome") || "success").toLowerCase();
  const outcome = OUTCOMES.has(raw) ? raw : "success";

  const merged = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key !== "outcome") merged.set(key, value);
  });

  if (request.method === "POST") {
    const form = await request.formData();
    form.forEach((value, key) => {
      if (value != null) merged.set(key, String(value));
    });
  }

  const target = new URL(`/checkout/payment/${outcome}`, request.url);
  merged.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target, { status: 302 });
}

export async function GET(request: NextRequest) {
  return handleBridge(request);
}

export async function POST(request: NextRequest) {
  return handleBridge(request);
}
