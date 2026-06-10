import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getCurrentUser } from "@/modules/auth/actions";
import { getUserAddresses } from "@/modules/account/queries";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const savedAddresses = await getUserAddresses(user.id);

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold">
          Checkout
        </h1>
        <p className="mt-1 text-muted-foreground">
          Complete your order in a few simple steps
        </p>
      </div>
      <CheckoutForm
        savedAddresses={savedAddresses}
        userEmail={user.email}
        userName={user.name}
      />
    </div>
  );
}
