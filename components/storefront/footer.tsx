"use client";

import Link from "next/link";
import {
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NewsletterSection } from "@/components/storefront/newsletter-section";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Deals", href: "/shop?deals=true" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Bestsellers", href: "/shop?sort=popular" },
  ],
  support: [
    { label: "Contact Us", href: "/shop" },
    { label: "Shipping Info", href: "/shop" },
    { label: "Returns", href: "/shop" },
    { label: "Track Order", href: "/account/orders" },
  ],
  company: [
    { label: "About Blueberry", href: "/shop" },
    { label: "Careers", href: "/shop" },
    { label: "Privacy Policy", href: "/shop" },
    { label: "Terms of Service", href: "/shop" },
  ],
};

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container-custom py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <div>
              <Link href="/" className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Blueberry
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Premium shopping with curated products, member-only deals, and
                fast delivery — designed for modern shoppers.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                hello@blueberry.store
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +1 (800) 555-0199
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                San Francisco, CA
              </p>
            </div>

            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4 lg:col-start-6">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold capitalize">{group}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold">Stay in the loop</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <NewsletterSection variant="inline" className="mt-4" />

            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-primary" />
                We Accept
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Blueberry. All rights reserved.</p>
          <p className="text-xs">Crafted for premium shoppers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
