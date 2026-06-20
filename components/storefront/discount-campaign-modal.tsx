"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiscountType } from "@/lib/types/database";
import { cn, formatPrice } from "@/lib/utils";

const DISMISS_KEY = "blueberry-discount-modal-v2";

export type DiscountCampaign = {
  id: string;
  code: string;
  discountType: DiscountType | string;
  amount: number;
  validUntil: string;
  minOrderAmount: number;
};

function formatDiscountLabel(coupon: DiscountCampaign) {
  const isPercentage =
    coupon.discountType === DiscountType.PERCENTAGE ||
    coupon.discountType === "PERCENTAGE";
  if (isPercentage) {
    return `${coupon.amount}% OFF`;
  }
  return `${formatPrice(coupon.amount)} OFF`;
}

function CouponSlide({ coupon }: { coupon: DiscountCampaign }) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-1 text-center sm:px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Tag className="h-7 w-7" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Exclusive offer
      </p>
      <p className="mt-1 font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {formatDiscountLabel(coupon)}
      </p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Use code at checkout
        {coupon.minOrderAmount > 0 &&
          ` on orders over ${formatPrice(coupon.minOrderAmount)}`}
      </p>
      <button
        type="button"
        onClick={copyCode}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-5 py-2.5 font-mono text-lg font-bold tracking-widest text-primary transition-colors hover:bg-primary/10"
      >
        {coupon.code}
        <Copy className="h-4 w-4 opacity-70" />
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Valid until {format(new Date(coupon.validUntil), "MMM d, yyyy")}
      </p>
      <Button asChild className="mt-5 w-full max-w-xs gap-2">
        <Link href="/shop?deals=true">Shop & Save</Link>
      </Button>
    </div>
  );
}

function CampaignSlider({ campaigns }: { campaigns: DiscountCampaign[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: campaigns.length > 1,
    align: "center",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, campaigns]);

  const showNav = campaigns.length > 1;

  return (
    <div className="relative px-4 pb-2 pt-4">
      {showNav && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full"
            onClick={scrollPrev}
            aria-label="Previous offer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-1 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full"
            onClick={scrollNext}
            aria-label="Next offer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {campaigns.map((coupon) => (
            <div
              key={coupon.id}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <CouponSlide coupon={coupon} />
            </div>
          ))}
        </div>
      </div>

      {showNav && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {campaigns.map((coupon, index) => (
            <button
              key={coupon.id}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to offer ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DiscountCampaignModalProps {
  campaigns: DiscountCampaign[];
}

export function DiscountCampaignModal({ campaigns }: DiscountCampaignModalProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || campaigns.length === 0) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(timer);
  }, [mounted, campaigns.length]);

  const dismissForSession = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }, []);

  if (!mounted || campaigns.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[100] max-w-md gap-0 overflow-hidden border bg-background p-0 shadow-2xl sm:max-w-lg [&~div]:z-[100]">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-background px-6 pb-2 pt-6">
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <Badge variant="warning" className="mx-auto w-fit gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Special Offers
            </Badge>
            <DialogTitle className="font-[family-name:var(--font-poppins)] text-xl sm:text-2xl">
              Don&apos;t miss these deals
            </DialogTitle>
          </DialogHeader>
        </div>

        {open ? <CampaignSlider campaigns={campaigns} /> : null}

        <div className="border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={dismissForSession}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
