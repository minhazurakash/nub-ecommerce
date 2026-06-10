"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  badge?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    title: "New Season Arrivals",
    subtitle: "Discover premium styles curated for you — fresh picks every week.",
    cta: "Shop Collection",
    href: "/shop",
    badge: "New In",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=800&fit=crop",
  },
  {
    id: "2",
    title: "Exclusive Deals",
    subtitle: "Up to 40% off on bestsellers — limited time only.",
    cta: "View Deals",
    href: "/shop?deals=true",
    badge: "Sale",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=800&fit=crop",
  },
  {
    id: "3",
    title: "Premium Essentials",
    subtitle: "Elevate your everyday with handpicked Blueberry favorites.",
    cta: "Explore Now",
    href: "/shop?featured=true",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=800&fit=crop",
  },
];

const trustItems = [
  { icon: Truck, label: `Free delivery over ${formatPrice(75)}` },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: Shield, label: "Secure checkout" },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  className?: string;
}

export function HeroCarousel({
  slides = defaultSlides,
  className,
}: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setProgress(0);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 100 / 60));
    }, 100);
    return () => clearInterval(interval);
  }, [selectedIndex]);

  return (
    <section className={cn("bg-muted/20", className)}>
      <div className="container-custom py-4 lg:py-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm lg:rounded-3xl">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide, slideIndex) => (
                <div
                  key={slide.id}
                  className="relative min-w-0 flex-[0_0_100%]"
                >
                  <div className="relative aspect-[16/7] min-h-[300px] w-full sm:min-h-[380px] lg:min-h-[440px]">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={slideIndex === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                    <div className="absolute inset-0 flex items-end pb-10 sm:items-center sm:pb-0">
                      <div className="w-full px-6 sm:px-10 lg:px-14">
                        <AnimatePresence mode="wait">
                          {selectedIndex === slideIndex && (
                            <motion.div
                              key={slide.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.45 }}
                              className="max-w-lg space-y-4 text-white sm:space-y-5"
                            >
                              {slide.badge && (
                                <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                  {slide.badge}
                                </span>
                              )}
                              <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                                {slide.title}
                              </h1>
                              <p className="max-w-md text-sm text-white/80 sm:text-base">
                                {slide.subtitle}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                  asChild
                                  size="lg"
                                  className="group rounded-full bg-white px-6 text-foreground hover:bg-white/90"
                                >
                                  <Link href={slide.href}>
                                    {slide.cta}
                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                  </Link>
                                </Button>
                                <Button
                                  asChild
                                  size="lg"
                                  variant="ghost"
                                  className="rounded-full text-white hover:bg-white/15 hover:text-white"
                                >
                                  <Link href="/shop?sort=newest">
                                    New Arrivals
                                  </Link>
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-white/80 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm sm:right-6 sm:top-6">
            {String(selectedIndex + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white sm:flex"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white sm:flex"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-6 left-6 flex gap-1.5 sm:left-10">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === selectedIndex
                    ? "w-8 bg-white"
                    : "w-4 bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-medium text-muted-foreground shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
