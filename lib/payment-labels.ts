import { PaymentMethod, PaymentStatus } from "@/lib/types/database";

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.COD:
      return "Cash on Delivery";
    case PaymentMethod.SSLCOMMERZ:
      return "SSLCommerz";
    default:
      return method;
  }
}

export function paymentStatusLabel(
  status: PaymentStatus,
  paymentMethod?: PaymentMethod
): string {
  if (status === PaymentStatus.PENDING && paymentMethod === PaymentMethod.COD) {
    return "Pay on delivery";
  }

  switch (status) {
    case PaymentStatus.PENDING:
      return "Awaiting payment";
    case PaymentStatus.PAID:
      return "Paid";
    case PaymentStatus.FAILED:
      return "Failed";
    case PaymentStatus.REFUNDED:
      return "Refunded";
    default:
      return status;
  }
}
