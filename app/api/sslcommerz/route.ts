import { NextRequest, NextResponse } from "next/server";

const SANDBOX_SESSION =
  "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const LIVE_SESSION =
  "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

/**
 * Server proxy for SSLCommerz session API (care-connect-hub api/sslcommerz.ts).
 * Optional — server actions call the gateway directly; this supports client use.
 */
export async function POST(request: NextRequest) {
  const bodyString = await request.text();
  if (!bodyString) {
    return new NextResponse("Empty body", { status: 400 });
  }

  const sessionUrl =
    process.env.SSLCOMMERZ_USE_LIVE === "true" ? LIVE_SESSION : SANDBOX_SESSION;

  const upstream = await fetch(sessionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: bodyString,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "text/plain; charset=utf-8",
    },
  });
}
