"use client";

import Link from "next/link";
import {
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { formatPrice } from "@/lib/utils";

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

const paymentMethods = ["bKash", "Nagad", "Visa", "Mastercard", "COD"];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

const trustBadges = [
  { icon: Truck, label: `Free delivery over ${formatPrice(75)}` },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: Shield, label: "Secure payments" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-primary-foreground/90">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-4">
            <div>
              <Link href="/" className="text-2xl font-bold">
                <span className="brand-wordmark text-primary-foreground">
                  Blueberry
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
                Bangladesh&apos;s trusted online store — curated products,
                exclusive deals, and fast delivery across the country.
              </p>
            </div>

            <div className="space-y-3 text-sm text-primary-foreground/70">
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary-foreground/80" />
                hello@blueberry.com.bd
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary-foreground/80" />
                +880 1700-000000
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/80" />
                Gulshan, Dhaka 1212, Bangladesh
              </p>
            </div>

            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground/70 transition-colors hover:border-primary-foreground/40 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
                  {group}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
              Newsletter
            </h3>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Get exclusive offers and new arrivals delivered to your inbox.
            </p>
            <NewsletterSection variant="footer" className="mt-4" />

            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
                <CreditCard className="h-3.5 w-3.5" />
                Payment Methods
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 px-3 py-1.5 text-xs font-medium text-primary-foreground/75"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-8 text-sm text-primary-foreground/55 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Blueberry. All rights reserved.
          </p>
          <p className="text-xs">Made with care in Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  );
}
