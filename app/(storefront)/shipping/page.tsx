import type { Metadata } from "next";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping Info | Blueberry",
  description: "Delivery times, shipping fees, and coverage across Bangladesh.",
};

export default function ShippingPage() {
  return (
    <StaticPageLayout
      title="Shipping Information"
      subtitle="Fast, reliable delivery across Bangladesh."
    >
      <StaticSection title="Delivery areas">
        <p>
          We deliver nationwide across Bangladesh. Dhaka metro orders typically
          ship faster; outside Dhaka delivery times may vary by courier route
          and weather conditions.
        </p>
      </StaticSection>

      <StaticSection title="Shipping fees">
        <p>
          Standard shipping is calculated at checkout based on weight, size, and
          destination. Orders over {formatPrice(75)} qualify for free delivery
          on eligible items.
        </p>
      </StaticSection>

      <StaticSection title="Processing & delivery times">
        <ul className="list-disc space-y-2 pl-5">
          <li>Orders are processed within 1–2 business days after confirmation.</li>
          <li>Dhaka delivery: usually 1–3 business days after dispatch.</li>
          <li>Outside Dhaka: usually 3–7 business days after dispatch.</li>
          <li>Peak seasons and sale events may add 1–2 extra days.</li>
        </ul>
      </StaticSection>

      <StaticSection title="Order tracking">
        <p>
          Once your order ships, you&apos;ll receive tracking details by SMS or
          email. You can also check status from your account orders page.
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
