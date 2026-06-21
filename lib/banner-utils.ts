export const BANNERS_CACHE_TAG = "banners";

export type HeroSlide = {
  id: string;
  promo: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  cta: string;
  href: string;
  image: string;
};

export function bannerToHeroSlide(banner: {
  id: string;
  title: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  ctaText: string;
  href: string;
  imageUrl: string;
}): HeroSlide {
  return {
    id: banner.id,
    promo: banner.title,
    headlineBefore: banner.headlineBefore,
    headlineHighlight: banner.headlineHighlight,
    headlineAfter: banner.headlineAfter,
    cta: banner.ctaText,
    href: banner.href,
    image: banner.imageUrl,
  };
}
