import { PaymentMethod, PaymentStatus } from "@/lib/types/database";
import { paymentStatusLabel } from "@/lib/payment-labels";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function statusVariant(
  status: PaymentStatus,
  paymentMethod?: PaymentMethod
): NonNullable<BadgeProps["variant"]> {
  if (status === PaymentStatus.PENDING) {
    return paymentMethod === PaymentMethod.COD ? "secondary" : "warning";
  }

  switch (status) {
    case PaymentStatus.PAID:
      return "success";
    case PaymentStatus.FAILED:
      return "destructive";
    case PaymentStatus.REFUNDED:
      return "outline";
    default:
      return "secondary";
  }
}

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  className?: string;
};

export function PaymentStatusBadge({
  status,
  paymentMethod,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <Badge
      variant={statusVariant(status, paymentMethod)}
      className={cn(className)}
    >
      {paymentStatusLabel(status, paymentMethod)}
    </Badge>
  );
}
