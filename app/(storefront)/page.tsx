export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { CategoryStrip } from "@/components/storefront/category-strip";
import { SectionHeader } from "@/components/storefront/section-header";
import { ProductGrid } from "@/components/storefront/product-grid";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { DiscountCampaignModal } from "@/components/storefront/discount-campaign-modal";
import { toProductCardData } from "@/lib/product-mapper";
import { bannerToHeroSlide } from "@/lib/banner-utils";
import { getActiveBanners } from "@/modules/banners/queries";
import { getFeaturedProducts, getDealProducts } from "@/modules/products/queries";
import { getTopLevelCategories } from "@/modules/categories/queries";
import { getBrands } from "@/modules/brands/queries";
import { getActiveCoupons } from "@/modules/coupons/queries";
import type { Coupon } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaleCountdown } from "@/components/storefront/sale-countdown";

export default async function HomePage() {
  let activeCoupons: Coupon[] = [];
  try {
    activeCoupons = await getActiveCoupons();
  } catch {
    activeCoupons = [];
  }

  const banners = await getActiveBanners();

  const [featured, deals, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getDealProducts(8),
    getTopLevelCategories(),
    getBrands(),
  ]);

  const campaigns = activeCoupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType as string,
    amount: coupon.amount,
    validUntil: coupon.validUntil,
    minOrderAmount: coupon.minOrderAmount,
  }));

  const heroSlides = banners.map(bannerToHeroSlide);

  return (
    <>
      <DiscountCampaignModal campaigns={campaigns} />
      <HeroCarousel
        key={heroSlides
          .map(
            (slide) =>
              `${slide.id}:${slide.headlineBefore}:${slide.headlineHighlight}:${slide.headlineAfter}:${slide.promo}`
          )
          .join("|")}
        slides={heroSlides}
      />

      <section className="container-custom py-10 sm:py-12 lg:py-16">
        <SectionHeader
          title="Featured Products"
          subtitle="Handpicked favorites this season"
          href="/shop?featured=true"
        />
        <div className="mt-6 sm:mt-8">
          <ProductGrid
            products={featured.map(toProductCardData)}
            cardVariant="buyNow"
          />
        </div>
      </section>

      <section className="container-custom overflow-hidden py-10 sm:py-14 lg:py-20">
        <CategoryStrip categories={categories} />
      </section>

      <section className="bg-secondary/50 py-10 sm:py-14 lg:py-20">
        <div className="container-custom">
          <div className="grid items-center gap-8 rounded-2xl border border-primary/10 bg-card p-5 sm:gap-10 sm:p-8 lg:grid-cols-2 lg:p-12">
            <div className="space-y-4 sm:space-y-5">
              <Badge variant="warning" className="gap-1 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Limited Time Offer
              </Badge>
              <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Summer Sale — Up to 50% Off
              </h2>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                Our biggest sale of the season is live. Premium products at
                unbeatable prices — while stocks last.
              </p>
              <Button asChild size="lg" className="group w-full sm:w-auto">
                <Link href="/shop?deals=true">
                  Shop Deals
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            <div className="rounded-xl bg-primary p-5 sm:p-8 lg:p-10">
              <SaleCountdown daysFromNow={22} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-10 sm:py-12 lg:py-16">
        <SectionHeader
          title="Best Sellers"
          subtitle="Most loved by our customers"
          href="/shop?sort=popular"
        />
        <div className="mt-6 sm:mt-8">
          <ProductGrid
            products={deals.map(toProductCardData)}
            cardVariant="buyNow"
          />
        </div>
      </section>

      {brands.length > 0 && (
        <section className="border-y bg-muted/30 py-10 sm:py-12 lg:py-16">
          <div className="container-custom">
            <SectionHeader
              title="Our Brands"
              subtitle="Trusted names you know and love"
            />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/shop?brand=${brand.slug}`}
                  className="rounded-full border bg-background px-6 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSection className="py-10 sm:py-14 lg:py-20" />
    </>
  );
}