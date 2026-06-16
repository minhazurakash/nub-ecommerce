import { requireRoleAdmin } from "@/modules/auth/actions";
import { ConsoleHeader } from "@/components/console/console-header";
import { CouponForm } from "@/components/console/coupon-form";

export default async function NewCouponPage() {
  const user = await requireRoleAdmin();

  return (
    <>
      <ConsoleHeader
        title="New coupon"
        description="Create a discount code for customers"
        user={user}
      />
      <div className="flex-1 overflow-auto p-6">
        <CouponForm />
      </div>
    </>
  );
}
