import type { Metadata } from "next";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "Careers | Blueberry",
  description: "Join the Blueberry team and help shape ecommerce in Bangladesh.",
};

export default function CareersPage() {
  return (
    <StaticPageLayout
      title="Careers at Blueberry"
      subtitle="We're building a modern shopping experience for Bangladesh — and we're growing."
    >
      <StaticSection title="Why work with us">
        <p>
          Blueberry is a small, focused team obsessed with product quality,
          design, and customer experience. We move quickly, learn constantly,
          and care about doing right by shoppers and teammates alike.
        </p>
      </StaticSection>

      <StaticSection title="Open roles">
        <p>
          We&apos;re always interested in hearing from talented people in
          engineering, operations, customer support, marketing, and merchandising.
          Current openings are shared on our social channels and updated here as
          positions become available.
        </p>
      </StaticSection>

      <StaticSection title="How to apply">
        <p>
          Send your CV and a short note about what you&apos;d like to work on to{" "}
          <a
            href="mailto:careers@blueberry.com.bd"
            className="text-primary underline-offset-4 hover:underline"
          >
            careers@blueberry.com.bd
          </a>
          . We review every application and reply when there&apos;s a potential fit.
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
