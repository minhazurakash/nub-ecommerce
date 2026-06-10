import type { Metadata } from "next";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Blueberry",
  description: "How Blueberry collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="Last updated: June 2026"
    >
      <StaticSection title="Information we collect">
        <p>
          When you create an account, place an order, or contact support, we may
          collect your name, email, phone number, delivery address, and payment
          details necessary to complete your purchase.
        </p>
      </StaticSection>

      <StaticSection title="How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Process and deliver orders.</li>
          <li>Provide customer support and order updates.</li>
          <li>Improve our website, products, and services.</li>
          <li>Send marketing emails only if you have opted in.</li>
        </ul>
      </StaticSection>

      <StaticSection title="Data security">
        <p>
          We use industry-standard safeguards to protect your data. Payment
          processing is handled through secure, trusted providers. We do not sell
          your personal information to third parties.
        </p>
      </StaticSection>

      <StaticSection title="Your choices">
        <p>
          You may update account details, unsubscribe from marketing emails, or
          request account deletion by contacting{" "}
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
