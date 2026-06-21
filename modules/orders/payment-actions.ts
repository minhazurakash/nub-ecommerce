"use server";

import {
  cancelSslCommerzOrder as cancelOrder,
  confirmSslCommerzPayment as confirmPayment,
} from "@/modules/orders/payment";

export async function confirmSslCommerzPayment(tranId: string, valId: string) {
  return confirmPayment(tranId, valId);
}

export async function cancelSslCommerzOrder(tranId: string) {
  return cancelOrder(tranId);
}
