import type { Metadata } from "next";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service | Blueberry",
  description: "Terms and conditions for using the Blueberry online store.",
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms of Service"
      subtitle="Last updated: June 2026"
    >
      <StaticSection title="Using our store">
        <p>
          By accessing blueberry.com.bd and placing orders, you agree to these
          terms. You must provide accurate account and delivery information and
          be legally able to enter into a binding contract under Bangladeshi law.
        </p>
      </StaticSection>

      <StaticSection title="Orders & pricing">
        <p>
          All prices are shown in Bangladeshi Taka (৳) unless stated otherwise.
          We reserve the right to correct pricing errors and cancel orders placed
          at incorrect prices, with a full refund if payment was captured.
        </p>
      </StaticSection>

      <StaticSection title="Payments">
        <p>
          We accept bKash, Nagad, major cards, and cash on delivery where
          available. Orders are confirmed after successful payment verification
          or COD acceptance at dispatch.
        </p>
      </StaticSection>

      <StaticSection title="Limitation of liability">
        <p>
          Blueberry is not liable for indirect damages arising from use of the
          site or delays caused by events outside our reasonable control,
          including courier disruptions or force majeure events.
        </p>
      </StaticSection>

      <StaticSection title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a
            href="mailto:hello@blueberry.com.bd"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@blueberry.com.bd
          </a>
          .
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
