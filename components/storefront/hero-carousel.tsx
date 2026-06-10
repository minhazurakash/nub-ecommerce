"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  { icon: Truck, label: "Free shipping over $75" },
  { icon: RotateCcw, label: "30-day easy returns" },
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className={cn("relative", className)}>
      <div className="relative overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {slides.map((slide, slideIndex) => (
              <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-[21/9] min-h-[320px] w-full sm:min-h-[400px] lg:min-h-[480px]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={slideIndex === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="container-custom">
                      <AnimatePresence mode="wait">
                        {selectedIndex === slideIndex && (
                          <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-xl space-y-5 text-white"
                          >
                            {slide.badge && (
                              <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/25">
                                {slide.badge}
                              </Badge>
                            )}
                            <h1 className="font-[family-name:var(--font-poppins)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                              {slide.title}
                            </h1>
                            <p className="max-w-md text-base text-white/85 sm:text-lg">
                              {slide.subtitle}
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                              <Button
                                asChild
                                size="lg"
                                className="bg-white text-primary hover:bg-white/90"
                              >
                                <Link href={slide.href}>{slide.cta}</Link>
                              </Button>
                              <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                              >
                                <Link href="/shop?sort=newest">New Arrivals</Link>
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

        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 rounded-full shadow-lg sm:flex"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 rounded-full shadow-lg sm:flex"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === selectedIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="border-b bg-muted/30">
        <div className="container-custom grid grid-cols-1 gap-4 py-5 sm:grid-cols-3">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
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
