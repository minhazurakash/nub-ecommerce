"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Home,
  Laptop,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount?: number;
  icon?: LucideIcon;
  _count?: { products: number };
}

const categoryIcons: Record<string, LucideIcon> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
};

const cardPastels = [
  { bg: "bg-[#e4f3ec]", icon: "text-[#3d8b6e]" },
  { bg: "bg-[#fdeee6]", icon: "text-[#d4644a]" },
  { bg: "bg-[#e8f0fc]", icon: "text-[#4a7fd4]" },
  { bg: "bg-[#f3ecfa]", icon: "text-[#8b5fbf]" },
  { bg: "bg-[#fdf6e3]", icon: "text-[#c4922a]" },
  { bg: "bg-[#e6f4f4]", icon: "text-[#3a9e9e]" },
];

const FEATURED_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=1000&fit=crop";

const AUTOPLAY_DELAY = 2800;

function getSlideMetrics(width: number) {
  if (width < 380) return { size: 136, gap: 12 };
  if (width < 640) return { size: 152, gap: 14 };
  if (width < 1024) return { size: 168, gap: 14 };
  return { size: 180, gap: 16 };
}

const defaultCategories: CategoryItem[] = [
  { id: "1", name: "Electronics", slug: "electronics", productCount: 0 },
  { id: "2", name: "Fashion", slug: "fashion", productCount: 0 },
  { id: "3", name: "Home", slug: "home", productCount: 0 },
  { id: "4", name: "Beauty", slug: "beauty", productCount: 0 },
  { id: "5", name: "Sports", slug: "sports", productCount: 0 },
];

interface CategoryStripProps {
  categories?: CategoryItem[];
  className?: string;
}

type LoopSlide = CategoryItem & { loopKey: string };

function normalizeCategories(items: CategoryItem[]): CategoryItem[] {
  return items.map((cat) => ({
    ...cat,
    productCount: cat.productCount ?? cat._count?.products ?? 0,
  }));
}

/** Embla loop needs enough slides — duplicate until we have plenty */
function buildLoopSlides(items: CategoryItem[]): LoopSlide[] {
  if (items.length === 0) return [];
  const target = Math.max(12, items.length * 3);
  const slides: LoopSlide[] = [];
  let round = 0;
  while (slides.length < target) {
    for (const item of items) {
      slides.push({
        ...item,
        loopKey: `${item.id}-${round}`,
      });
      if (slides.length >= target) break;
    }
    round += 1;
  }
  return slides;
}

function CategoryCard({
  category,
  index,
}: {
  category: CategoryItem;
  index: number;
}) {
  const slugKey = category.slug.toLowerCase();
  const Icon = category.icon ?? categoryIcons[slugKey] ?? Sparkles;
  const pastel = cardPastels[index % cardPastels.length];
  const count = category.productCount ?? 0;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={cn(
        "group flex h-[168px] w-full flex-col items-center justify-center rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md min-[400px]:h-[180px] sm:h-[200px] sm:p-5 lg:h-[220px]",
        pastel.bg
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]",
          pastel.icon
        )}
      >
        <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-center font-[family-name:var(--font-poppins)] text-base font-bold text-foreground sm:text-lg">
        {category.name}
      </h3>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {count} {count === 1 ? "item" : "items"}
      </p>
    </Link>
  );
}

export function CategoryStrip({
  categories = defaultCategories,
  className,
}: CategoryStripProps) {
  const items = useMemo(() => normalizeCategories(categories), [categories]);
  const loopSlides = useMemo(() => buildLoopSlides(items), [items]);
  const featuredImage =
    items.find((c) => c.imageUrl)?.imageUrl ?? FEATURED_IMAGE;

  const [slideMetrics, setSlideMetrics] = useState(() =>
    typeof window !== "undefined"
      ? getSlideMetrics(window.innerWidth)
      : { size: 180, gap: 16 }
  );

  useEffect(() => {
    const update = () => setSlideMetrics(getSlideMetrics(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      skipSnaps: false,
      containScroll: false,
    },
    [autoplayPlugin]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    autoplayPlugin.reset?.();
  }, [emblaApi, autoplayPlugin]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    autoplayPlugin.reset?.();
  }, [emblaApi, autoplayPlugin]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    const autoplay = emblaApi.plugins()?.autoplay;
    autoplay?.play();
  }, [emblaApi, loopSlides, slideMetrics]);

  if (items.length === 0) return null;

  return (
    <section
      className={cn("relative", className)}
      style={
        {
          "--slide-size": `${slideMetrics.size}px`,
          "--slide-gap": `${slideMetrics.gap}px`,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10 mb-6 sm:mb-8 lg:mb-10">
        <p className="text-sm font-medium text-primary">Browse collections</p>
        <h2 className="mt-1 font-[family-name:var(--font-poppins)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Shop by Category
        </h2>
      </div>

      <div className="relative z-10 grid gap-6 sm:gap-8 lg:grid-cols-[minmax(260px,36%)_1fr] lg:items-stretch lg:gap-6">
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:mx-0 lg:flex lg:max-w-none lg:flex-col lg:justify-end">
          <Link href="/shop?deals=true" className="group relative block">
            <div className="relative overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={featuredImage}
                  alt="Shop our best deals"
                  fill
                  sizes="(max-width: 1024px) 360px, 36vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-px right-0 z-10 hidden h-[7.5rem] w-[6.5rem] rounded-tl-[2.75rem] bg-background lg:block xl:h-[8.5rem] xl:w-[7.5rem]"
            />
            <Badge className="absolute right-4 top-4 z-20 bg-foreground px-3 py-1 text-xs font-semibold text-background">
              50% Off
            </Badge>
          </Link>
        </div>

        <div className="relative z-10 flex min-w-0 flex-col lg:-ml-10 lg:min-h-0 xl:-ml-16">
          <div className="hidden flex-1 items-start justify-end pt-4 lg:flex lg:pt-8 xl:pt-10">
            <p
              aria-hidden
              className="pointer-events-none select-none text-right font-[family-name:var(--font-poppins)] text-[3rem] font-bold leading-[0.95] tracking-tight text-transparent xl:text-[4.25rem] 2xl:text-[5rem]"
              style={{ WebkitTextStroke: "1.5px oklch(0.88 0.02 252)" }}
            >
              Explore
              <br />
              Categories
            </p>
          </div>

          <p
            aria-hidden
            className="pointer-events-none mb-3 select-none text-center font-[family-name:var(--font-poppins)] text-[2rem] font-bold leading-[0.95] tracking-tight text-transparent sm:text-[2.35rem] lg:hidden"
            style={{ WebkitTextStroke: "1.5px oklch(0.88 0.02 252)" }}
          >
            Explore Categories
          </p>

          <div className="mt-auto">
            <div className="mb-3 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                onClick={scrollPrev}
                aria-label="Previous category"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                onClick={scrollNext}
                aria-label="Next category"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div
                className="flex touch-pan-y"
                style={{ marginLeft: "calc(var(--slide-gap) * -1)" }}
              >
                {loopSlides.map((category, index) => (
                  <div
                    key={category.loopKey}
                    className="min-w-0 shrink-0 pl-[var(--slide-gap)]"
                    style={{
                      flex: "0 0 var(--slide-size)",
                    }}
                  >
                    <CategoryCard
                      category={category}
                      index={index % items.length}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
