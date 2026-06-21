import { NextRequest, NextResponse } from "next/server";

async function redirectToBridge(request: NextRequest, outcome: string) {
  const target = new URL("/api/payments/sslcommerz/bridge", request.url);
  target.searchParams.set("outcome", outcome);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  if (request.method === "POST") {
    const form = await request.formData();
    form.forEach((value, key) => target.searchParams.set(key, String(value)));
  }

  return NextResponse.redirect(target, { status: 302 });
}

export async function GET(request: NextRequest) {
  return redirectToBridge(request, "cancel");
}

export async function POST(request: NextRequest) {
  return redirectToBridge(request, "cancel");
}
