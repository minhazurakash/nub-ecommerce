export const DEFAULT_BANNER_SEEDS = [
  {
    id: "worldcup-2026",
    title: "2026 FIFA World Cup",
    headlineBefore: "Official",
    headlineHighlight: "World Cup",
    headlineAfter: "Jerseys",
    ctaText: "Shop Jerseys",
    href: "/shop",
    imageUrl: "/banners/worldcup-2026-official-jerseys.png",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "worldcup-fan-made",
    title: "Premium Collection",
    headlineBefore: "Fan Made",
    headlineHighlight: "World Cup",
    headlineAfter: "Jerseys",
    ctaText: "Explore Collection",
    href: "/shop?deals=true",
    imageUrl: "/banners/worldcup-fan-made-jerseys.png",
    sortOrder: 1,
    isActive: true,
  },
] as const;

export function defaultBannerRowsForDb() {
  return DEFAULT_BANNER_SEEDS.map((banner) => ({
    id: banner.id,
    title: banner.title,
    headline_before: banner.headlineBefore,
    headline_highlight: banner.headlineHighlight,
    headline_after: banner.headlineAfter,
    cta_text: banner.ctaText,
    href: banner.href,
    image_url: banner.imageUrl,
    sort_order: banner.sortOrder,
    is_active: banner.isActive,
  }));
}

export function defaultHeroSlides() {
  return DEFAULT_BANNER_SEEDS.map((banner) => ({
    id: banner.id,
    promo: banner.title,
    headlineBefore: banner.headlineBefore,
    headlineHighlight: banner.headlineHighlight,
    headlineAfter: banner.headlineAfter,
    cta: banner.ctaText,
    href: banner.href,
    image: banner.imageUrl,
  }));
}
