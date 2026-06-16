"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { Coupon } from "@/lib/types/database";
import { DiscountType } from "@/lib/types/database";
import { saveCoupon, type CouponFormState } from "@/modules/coupons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

type CouponFormProps = {
  coupon?: Coupon;
};

const initialState: CouponFormState = {};

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function CouponForm({ coupon }: CouponFormProps) {
  const [state, formAction, isPending] = useActionState(saveCoupon, initialState);
  const [discountType, setDiscountType] = useState(
    coupon?.discountType ?? DiscountType.PERCENTAGE
  );
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);

  const defaultValidFrom = coupon?.validFrom
    ? toDateInputValue(coupon.validFrom)
    : toDateInputValue(new Date().toISOString());
  const defaultValidUntil = coupon?.validUntil
    ? toDateInputValue(coupon.validUntil)
    : toDateInputValue(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {coupon?.id ? <input type="hidden" name="id" value={coupon.id} /> : null}
      <input type="hidden" name="discountType" value={discountType} />
      <input type="hidden" name="isActive" value={isActive ? "on" : ""} />

      {state.error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coupon details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon code</Label>
            <Input
              id="code"
              name="code"
              defaultValue={coupon?.code}
              placeholder="SUMMER25"
              className="uppercase"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount type</Label>
              <Select
                value={discountType}
                onValueChange={(value) =>
                  setDiscountType(value as DiscountType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value={DiscountType.FLAT}>
                    Flat amount ($)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                {discountType === DiscountType.PERCENTAGE
                  ? "Percentage"
                  : "Amount ($)"}
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step={discountType === DiscountType.PERCENTAGE ? "1" : "0.01"}
                min="0"
                defaultValue={coupon?.amount}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid from</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="date"
                defaultValue={defaultValidFrom}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={defaultValidUntil}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max uses (optional)</Label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                min="1"
                placeholder="Unlimited"
                defaultValue={coupon?.maxUses ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Min order amount ($)</Label>
              <Input
                id="minOrderAmount"
                name="minOrderAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={coupon?.minOrderAmount ?? 0}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive" className="font-normal">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {coupon ? "Update coupon" : "Create coupon"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/console/coupons">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
