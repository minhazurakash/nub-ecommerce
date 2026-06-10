import type { Metadata } from "next";
import Link from "next/link";
import {
  StaticPageLayout,
  StaticSection,
} from "@/components/storefront/static-page-layout";

export const metadata: Metadata = {
  title: "Contact Us | Blueberry",
  description: "Get in touch with the Blueberry customer support team.",
};

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="We're here to help with orders, products, and account questions."
    >
      <StaticSection title="Customer support">
        <p>
          Reach us Monday to Saturday, 10:00 AM – 8:00 PM (BST). We aim to
          reply within one business day.
        </p>
        <ul className="space-y-2">
          <li>
            <span className="font-medium text-foreground">Email: </span>
            <a
              href="mailto:hello@blueberry.com.bd"
              className="text-primary underline-offset-4 hover:underline"
            >
              hello@blueberry.com.bd
            </a>
          </li>
          <li>
            <span className="font-medium text-foreground">Phone: </span>
            <a
              href="tel:+8801700000000"
              className="text-primary underline-offset-4 hover:underline"
            >
              +880 1700-000000
            </a>
          </li>
          <li>
            <span className="font-medium text-foreground">Address: </span>
            Gulshan, Dhaka 1212, Bangladesh
          </li>
        </ul>
      </StaticSection>

      <StaticSection title="Order help">
        <p>
          For order updates, visit{" "}
          <Link href="/account/orders" className="text-primary hover:underline">
            My Orders
          </Link>{" "}
          when signed in, or email us with your order number.
        </p>
      </StaticSection>

      <StaticSection title="Business inquiries">
        <p>
          For partnerships and wholesale, email{" "}
          <a
            href="mailto:partners@blueberry.com.bd"
            className="text-primary underline-offset-4 hover:underline"
          >
            partners@blueberry.com.bd
          </a>
          .
        </p>
      </StaticSection>
    </StaticPageLayout>
  );
}
