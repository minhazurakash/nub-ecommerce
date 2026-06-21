import { PaymentResultClient } from "@/components/storefront/payment-result-client";
import { isSslCommerzSandbox } from "@/lib/sslcommerz/config";
import { Badge } from "@/components/ui/badge";

type PaymentOutcomePageProps = {
  params: Promise<{ outcome: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentOutcomePage({
  params,
  searchParams,
}: PaymentOutcomePageProps) {
  const { outcome } = await params;
  const query = await searchParams;

  return (
    <div className="container-custom py-10">
      {isSslCommerzSandbox() ? (
        <div className="mb-6 flex justify-center">
          <Badge variant="secondary">SSLCommerz sandbox</Badge>
        </div>
      ) : null}
      <PaymentResultClient outcome={outcome} searchParams={query} />
    </div>
  );
}
