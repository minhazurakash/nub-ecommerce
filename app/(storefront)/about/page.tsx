import type { Metadata } from "next";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "About Us | Blueberry",
  description:
    "Learn about Blueberry — Bangladesh's trusted online store for curated products and reliable delivery.",
};

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="About Blueberry"
      subtitle="Curated shopping, delivered with care across Bangladesh."
    >
      <StaticSection title="Who we are">
        <p>
          Blueberry is a Bangladeshi ecommerce brand built around quality,
          trust, and convenience. We handpick products across electronics,
          fashion, home, beauty, and more — so you can shop confidently from
          one place.
        </p>
        <p>
          From Dhaka to districts nationwide, we focus on fast fulfillment,
          transparent pricing in taka, and customer support that actually
          responds.
        </p>
      </StaticSection>

      <StaticSection title="What we believe">
        <ul className="list-disc space-y-2 pl-5">
          <li>Fair prices with clear value — no hidden surprises at checkout.</li>
          <li>Reliable delivery and easy returns when something isn&apos;t right.</li>
          <li>Local payment options including bKash, Nagad, cards, and COD.</li>
          <li>A shopping experience that works beautifully on mobile and desktop.</li>
        </ul>
      </StaticSection>

      <StaticSection title="Our promise">
        <p>
          Whether you&apos;re ordering everyday essentials or a special gift,
          we treat every package like it&apos;s heading to someone who matters —
          because it is.
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
