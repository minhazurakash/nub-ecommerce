import { NextRequest, NextResponse } from "next/server";
import { confirmSslCommerzPayment } from "@/modules/orders/payment";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");
  const status = String(form.get("status") ?? "");

  if (tranId && valId && (status === "VALID" || status === "VALIDATED")) {
    await confirmSslCommerzPayment(tranId, valId);
  }

  return NextResponse.json({ received: true });
}
