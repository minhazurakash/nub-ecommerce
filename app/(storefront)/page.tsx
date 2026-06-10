import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { CategoryStrip } from "@/components/storefront/category-strip";
import { SectionHeader } from "@/components/storefront/section-header";
import { ProductGrid } from "@/components/storefront/product-grid";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { toProductCardData } from "@/lib/product-mapper";
import { getFeaturedProducts, getDealProducts } from "@/modules/products/queries";
import { getTopLevelCategories } from "@/modules/categories/queries";
import { getBrands } from "@/modules/brands/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const [featured, deals, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getDealProducts(8),
    getTopLevelCategories(),
    getBrands(),
  ]);

  return (
    <>
      <HeroCarousel />

      <section className="container-custom py-14 lg:py-16">
        <SectionHeader
          title="Shop by Category"
          subtitle="Browse our curated collections"
          href="/shop"
          linkLabel="All Categories"
        />
        <div className="mt-8">
          <CategoryStrip categories={categories} />
        </div>
      </section>

      <section className="container-custom py-14 lg:py-16">
        <SectionHeader
          title="Featured Products"
          subtitle="Handpicked favorites this season"
          href="/shop?featured=true"
        />
        <div className="mt-8">
          <ProductGrid products={featured.map(toProductCardData)} />
        </div>
      </section>

      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-primary/10" />
        <div className="container-custom relative">
          <div className="grid items-center gap-10 rounded-3xl border bg-card/80 p-8 shadow-sm backdrop-blur-sm lg:grid-cols-2 lg:p-12">
            <div className="space-y-5">
              <Badge variant="warning" className="gap-1 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Limited Time Offer
              </Badge>
              <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Summer Sale — Up to 50% Off
              </h2>
              <p className="max-w-md text-muted-foreground">
                Our biggest sale of the season is live. Premium products at
                unbeatable prices — while stocks last.
              </p>
              <Button asChild size="lg" className="group">
                <Link href="/shop?deals=true">
                  Shop Deals
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent p-10 text-center text-primary-foreground shadow-lg">
              <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/80">
                Ends Soon
              </p>
              <div className="mt-3 font-[family-name:var(--font-poppins)] text-5xl font-bold tabular-nums md:text-6xl">
                02:14:35
              </div>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Hours · Minutes · Seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-14 lg:py-16">
        <SectionHeader
          title="Best Sellers"
          subtitle="Most loved by our customers"
          href="/shop?sort=popular"
        />
        <div className="mt-8">
          <ProductGrid products={deals.map(toProductCardData)} />
        </div>
      </section>

      {brands.length > 0 && (
        <section className="border-y bg-muted/30 py-14 lg:py-16">
          <div className="container-custom">
            <SectionHeader
              title="Our Brands"
              subtitle="Trusted names you know and love"
            />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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

      <NewsletterSection className="py-16 lg:py-20" />
    </>
  );
}
