import type { Metadata } from "next";
import Link from "next/link";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "Returns & Refunds | Blueberry",
  description: "Blueberry return policy and refund process.",
};

export default function ReturnsPage() {
  return (
    <StaticPageLayout
      title="Returns & Refunds"
      subtitle="Simple returns within 7 days for eligible products."
    >
      <StaticSection title="7-day easy returns">
        <p>
          If your item arrives damaged, defective, or not as described, you may
          request a return within 7 days of delivery. Products must be unused,
          in original packaging, and include all tags and accessories.
        </p>
      </StaticSection>

      <StaticSection title="How to start a return">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Contact us at{" "}
            <a
              href="mailto:hello@blueberry.com.bd"
              className="text-primary hover:underline"
            >
              hello@blueberry.com.bd
            </a>{" "}
            with your order number and photos if applicable.
          </li>
          <li>Our team will confirm eligibility and share return instructions.</li>
          <li>Once we receive and inspect the item, refunds are processed to your original payment method.</li>
        </ol>
      </StaticSection>

      <StaticSection title="Non-returnable items">
        <ul className="list-disc space-y-2 pl-5">
          <li>Personal care and hygiene products once opened.</li>
          <li>Custom or made-to-order items unless defective.</li>
          <li>Digital goods and gift cards.</li>
        </ul>
      </StaticSection>

      <StaticSection title="Need help?">
        <p>
          Visit our{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact page
          </Link>{" "}
          for support with returns and exchanges.
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
