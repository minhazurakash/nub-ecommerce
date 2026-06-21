import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getCurrentUser } from "@/modules/auth/actions";
import { getUserAddresses } from "@/modules/account/queries";
import { redirect } from "next/navigation";

type CheckoutPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const paymentErrors: Record<string, string> = {
  "payment-failed":
    "Online payment could not be completed. Please try again or choose Cash on Delivery.",
  "payment-cancelled":
    "Payment was cancelled. Your cart is unchanged — you can try again when ready.",
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const savedAddresses = await getUserAddresses(user.id);
  const { error } = await searchParams;

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
        paymentError={error ? paymentErrors[error] ?? null : null}
      />
    </div>
  );
}
