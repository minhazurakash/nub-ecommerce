"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSectionProps {
  variant?: "banner" | "inline" | "footer";
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

  if (variant === "inline" || variant === "footer") {
    const isFooter = variant === "footer";
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="relative">
          <Mail
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isFooter ? "text-primary-foreground/40" : "text-muted-foreground"}`}
          />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              isFooter
                ? "border-primary-foreground/15 bg-primary-foreground/10 pl-9 text-primary-foreground placeholder:text-primary-foreground/40"
                : "pl-9"
            }
            required
          />
        </div>
        <Button
          type="submit"
          className="mt-3 w-full"
          variant={isFooter ? "secondary" : "default"}
          disabled={loading}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <section className={className}>
      <div className="container-custom">
        <div className="rounded-2xl border border-primary/15 bg-secondary/40 px-6 py-12 sm:px-12 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Newsletter
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Stay updated on new arrivals
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Get early access to sales, restocks, and curated picks — plus 10%
              off your first order.
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
                  className="h-11 pl-10"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 px-8"
                disabled={loading}
              >
                {loading ? "Joining..." : "Subscribe"}
              </Button>
            </form>

            <p className="mt-4 text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
