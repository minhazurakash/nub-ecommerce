import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRoleAdmin } from "@/modules/auth/actions";
import { getCoupons } from "@/modules/coupons/queries";
import { deleteCoupon } from "@/modules/coupons/actions";
import { ConsoleHeader } from "@/components/console/console-header";
import { DiscountType } from "@/lib/types/database";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ConsoleCouponsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function formatDiscount(coupon: {
  discountType: DiscountType;
  amount: number;
}) {
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    return `${coupon.amount}%`;
  }
  return formatPrice(coupon.amount);
}

function couponStatus(coupon: {
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
}) {
  const now = new Date();
  if (!coupon.isActive) return "Inactive";
  if (now < new Date(coupon.validFrom)) return "Scheduled";
  if (now > new Date(coupon.validUntil)) return "Expired";
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return "Exhausted";
  }
  return "Active";
}

export default async function ConsoleCouponsPage({
  searchParams,
}: ConsoleCouponsPageProps) {
  const user = await requireRoleAdmin();
  const coupons = await getCoupons();
  const { error } = await searchParams;

  const errorMessage =
    error === "in-use"
      ? "Cannot delete a coupon that has been used on orders."
      : error === "delete-failed"
        ? "Failed to delete coupon."
        : null;

  return (
    <>
      <ConsoleHeader
        title="Discounts"
        description="Create and manage coupon codes"
        user={user}
      />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {errorMessage ? (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button asChild>
            <Link href="/console/coupons/new">
              <Plus className="mr-2 h-4 w-4" />
              New coupon
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No coupons yet. Create your first discount code.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const status = couponStatus(coupon);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell>{formatDiscount(coupon)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(coupon.validFrom).toLocaleDateString()} –{" "}
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.usedCount}
                        {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
                      </TableCell>
                      <TableCell>{status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/console/coupons/${coupon.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <form action={deleteCoupon}>
                            <input type="hidden" name="id" value={coupon.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
