import { Suspense } from "react";
import { getBrands } from "@/modules/brands/queries";
import { getProducts } from "@/modules/products/queries";
import { getTopLevelCategories } from "@/modules/categories/queries";
import {
  ShopFilters,
  ShopResults,
} from "@/components/storefront/shop-filters";
import { toProductCardData } from "@/lib/product-mapper";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductFilterInput } from "@/lib/validations/product";

interface ShopPageProps {
  searchParams: Promise<Partial<ProductFilterInput>>;
}

function ShopContentFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function ShopContent({
  searchParams,
}: {
  searchParams: Partial<ProductFilterInput>;
}) {
  const result = await getProducts(searchParams);

  const products = result.products.map(toProductCardData);

  return (
    <ShopResults
      products={products}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const [categories, brands] = await Promise.all([
    getTopLevelCategories(),
    getBrands(),
  ]);

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold">
          Shop
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse our full collection of premium products
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <ShopFilters
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }))}
          brands={brands.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
          }))}
        />

        <div className="flex-1 space-y-6">
          <Suspense fallback={<ShopContentFallback />}>
            <ShopContent searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
