"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import { Truck, Shield, RotateCcw } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  promo: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  cta: string;
  href: string;
  image: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    promo: "Flat 30% Off",
    headlineBefore: "Explore",
    headlineHighlight: "Fresh",
    headlineAfter: "Daily Groceries",
    cta: "Shop Now",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=720&fit=crop&q=80",
  },
  {
    id: "2",
    promo: "Limited Time Deals",
    headlineBefore: "Discover",
    headlineHighlight: "Top",
    headlineAfter: "Fashion Deals",
    cta: "View Deals",
    href: "/shop?deals=true",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=720&fit=crop&q=80",
  },
  {
    id: "3",
    promo: "Free Delivery",
    headlineBefore: "Shop",
    headlineHighlight: "Smart",
    headlineAfter: "Online Today",
    cta: "Explore Now",
    href: "/shop?featured=true",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=720&fit=crop&q=80",
  },
];

const trustItems = [
  { icon: Truck, label: `Free delivery over ${formatPrice(75)}` },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: Shield, label: "Secure checkout" },
];

const AUTOPLAY_MS = 5000;
const SWIPE_OFFSET_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 350;

const textContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const textItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const HERO_LIQUID_CLIP = "url(#hero-liquid-blob)";

/**
 * Organic blob clip traced from the reference pebble/kidney shape:
 * wider right bulge, softer left taper, slight dip along the bottom edge.
 */
function HeroLiquidBlobDefs() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <defs>
        <clipPath id="hero-liquid-blob" clipPathUnits="objectBoundingBox">
          <path d="M 0.17 0.28 C 0.27 0.11 0.49 0.06 0.71 0.1 C 0.9 0.14 0.98 0.32 0.96 0.51 C 0.94 0.71 0.85 0.87 0.64 0.92 C 0.52 0.95 0.42 0.86 0.34 0.88 C 0.21 0.91 0.07 0.8 0.07 0.57 C 0.07 0.35 0.1 0.3 0.17 0.28 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function HeadlineSquiggle({ className }: { className?: string }) {
  return (
    <motion.svg
      width="52"
      height="22"
      viewBox="0 0 52 22"
      fill="none"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
    >
      <motion.path
        d="M3 16 C12 4, 20 18, 30 8 S44 14, 49 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
      />
    </motion.svg>
  );
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
  className?: string;
}

export function HeroCarousel({
  slides = defaultSlides,
  className,
}: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dragX = useMotionValue(0);

  const scrollTo = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      if (
        offset.x < -SWIPE_OFFSET_THRESHOLD ||
        velocity.x < -SWIPE_VELOCITY_THRESHOLD
      ) {
        goToNext();
      } else if (
        offset.x > SWIPE_OFFSET_THRESHOLD ||
        velocity.x > SWIPE_VELOCITY_THRESHOLD
      ) {
        goToPrev();
      }
      animate(dragX, 0, {
        type: "spring",
        stiffness: 380,
        damping: 32,
      });
      setIsPaused(false);
    },
    [dragX, goToNext, goToPrev]
  );

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[selectedIndex] ?? slides[0];

  return (
    <section className={cn("bg-background", className)}>
      <HeroLiquidBlobDefs />
      <div className="container-custom py-6 sm:py-8 lg:py-14">
        <motion.div
          className="relative grid min-h-0 cursor-grab touch-pan-y items-center gap-6 active:cursor-grabbing sm:min-h-[340px] sm:gap-8 lg:grid-cols-2 lg:gap-10 lg:min-h-[380px] xl:min-h-[440px]"
          style={{ x: dragX }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={handleDragEnd}
        >
          {/* Copy — below image on mobile, left column on desktop */}
          <div className="relative z-10 order-2 flex flex-col justify-center px-0 sm:px-4 lg:order-1 lg:px-8 lg:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                variants={textContainer}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-6"
              >
                <motion.p
                  variants={textItem}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {activeSlide.promo}
                </motion.p>

                <motion.h1
                  variants={textItem}
                  className="font-[family-name:var(--font-poppins)] text-[1.65rem] font-bold leading-[1.2] tracking-tight text-foreground min-[400px]:text-[2rem] sm:text-4xl lg:text-[2.65rem] xl:text-5xl"
                >
                  {activeSlide.headlineBefore}{" "}
                  <span className="relative inline-block">
                    <HeadlineSquiggle className="absolute -top-5 left-0 text-foreground" />
                    <span className="text-primary">
                      {activeSlide.headlineHighlight}
                    </span>
                  </span>{" "}
                  {activeSlide.headlineAfter}
                </motion.h1>

                <motion.div variants={textItem}>
                  <Link
                    href={activeSlide.href}
                    className="inline-flex rounded-full border border-border px-8 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {activeSlide.cta}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-2.5 sm:mt-10 lg:mt-14">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500 ease-out",
                    index === selectedIndex
                      ? "w-9 bg-primary"
                      : "w-2 bg-foreground/20 hover:bg-foreground/35"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Image — first on mobile, right column on desktop */}
          <div
            className="relative order-1 mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-[min(100%,32rem)] lg:order-2 lg:mx-0 lg:max-w-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative aspect-[1000/720] w-full">
              <div
                aria-hidden
                className="absolute inset-0 scale-[1.045] bg-gradient-to-br from-secondary/70 via-primary/15 to-muted/50"
                style={{ clipPath: HERO_LIQUID_CLIP }}
              />
              <div
                className="relative h-full w-full drop-shadow-md"
                style={{ clipPath: HERO_LIQUID_CLIP }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 bg-muted/30"
                  >
                    <Image
                      src={activeSlide.image}
                      alt={`${activeSlide.headlineBefore} ${activeSlide.headlineHighlight} ${activeSlide.headlineAfter}`}
                      fill
                      priority={selectedIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:mt-8 lg:mt-10">
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 px-4 py-3.5 text-sm font-medium text-muted-foreground"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
