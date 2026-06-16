import { notFound } from "next/navigation";
import { requireRoleAdmin } from "@/modules/auth/actions";
import { getCouponById } from "@/modules/coupons/queries";
import { ConsoleHeader } from "@/components/console/console-header";
import { CouponForm } from "@/components/console/coupon-form";

type EditCouponPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const user = await requireRoleAdmin();
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) notFound();

  return (
    <>
      <ConsoleHeader
        title={`Edit ${coupon.code}`}
        description="Update coupon settings"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <CouponForm coupon={coupon} />
      </div>
    </>
  );
}
