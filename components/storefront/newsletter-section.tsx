"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSectionProps {
  variant?: "banner" | "inline";
  className?: string;
}

export function NewsletterSection({
  variant = "banner",
  className,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("You're subscribed! Check your inbox for a welcome offer.");
    setEmail("");
    setLoading(false);
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" className="mt-3 w-full" disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <section className={className}>
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent px-6 py-14 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Exclusive member perks
            </div>
            <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight sm:text-4xl">
              Subscribe to Our Newsletter
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-primary-foreground/90">
              Get early access to sales, new arrivals, and curated style picks —
              plus 10% off your first order.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-0 bg-white pl-10 text-foreground shadow-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="h-12 px-8 font-semibold"
                disabled={loading}
              >
                {loading ? "Joining..." : "Subscribe"}
              </Button>
            </form>

            <p className="mt-4 text-xs text-primary-foreground/70">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
