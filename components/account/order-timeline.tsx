import type { ElementType } from "react";
import { OrderStatus } from "@/lib/types/database";
import { Check, Circle, Package, Truck, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineStep = {
  key: string;
  label: string;
  description: string;
  icon: ElementType;
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "placed",
    label: "Order placed",
    description: "We received your order",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "On the way to you",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Package arrived",
    icon: Check,
  },
];

function getStepState(
  stepIndex: number,
  status: OrderStatus
): "complete" | "current" | "upcoming" | "cancelled" {
  if (status === "CANCELLED") {
    return stepIndex === 0 ? "cancelled" : "upcoming";
  }

  const statusIndex: Record<OrderStatus, number> = {
    PENDING: 0,
    AWAITING_PAYMENT: 0,
    SHIPPED: 1,
    DELIVERED: 2,
    CANCELLED: 0,
  };

  const currentIndex = statusIndex[status];

  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

type OrderTimelineProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderTimeline({ status, className }: OrderTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-destructive">Order cancelled</p>
          <p className="text-sm text-muted-foreground">
            This order was cancelled and will not be fulfilled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {TIMELINE_STEPS.map((step, index) => {
        const state = getStepState(index, status);
        const Icon = step.icon;
        const isLast = index === TIMELINE_STEPS.length - 1;

        return (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-4 top-8 h-[calc(100%-2rem)] w-px -translate-x-1/2",
                  state === "complete" ? "bg-primary" : "bg-border"
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                state === "complete" &&
                  "border-primary bg-primary text-primary-foreground",
                state === "current" &&
                  "border-primary bg-background text-primary",
                state === "upcoming" &&
                  "border-muted-foreground/30 bg-background text-muted-foreground"
              )}
            >
              {state === "complete" ? (
                <Check className="h-4 w-4" />
              ) : state === "current" ? (
                <Icon className="h-4 w-4" />
              ) : (
                <Circle className="h-2.5 w-2.5 fill-current" />
              )}
            </div>

            <div className="pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "upcoming"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
