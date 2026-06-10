"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Grid3X3, LayoutList, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { type ProductCardData } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { productSortOptions } from "@/lib/validations/product";
import { cn, formatPrice } from "@/lib/utils";

type FilterCategory = { id: string; name: string; slug: string };
type FilterBrand = { id: string; name: string; slug: string };

interface ShopFiltersProps {
  categories: FilterCategory[];
  brands: FilterBrand[];
  className?: string;
}

const SORT_LABELS: Record<(typeof productSortOptions)[number], string> = {
  newest: "Newest",
  popular: "Most Popular",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating: "Top Rated",
  title: "Name A–Z",
};

const RATING_OPTIONS = [
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "1", label: "1+ Stars" },
];

function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (!("page" in updates)) {
        params.delete("page");
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return { searchParams, updateParams };
}

function FilterFields({
  categories,
  brands,
  onApply,
}: ShopFiltersProps & { onApply?: () => void }) {
  const { searchParams, updateParams } = useFilterParams();

  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const rating = searchParams.get("rating") ?? "";

  const handleApply = () => {
    onApply?.();
  };

  const handleClear = () => {
    updateParams({
      category: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      rating: null,
      page: null,
    });
    onApply?.();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Brand</Label>
        <Select
          value={brand || "all"}
          onValueChange={(value) =>
            updateParams({ brand: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) =>
              updateParams({ minPrice: e.target.value || null })
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) =>
              updateParams({ maxPrice: e.target.value || null })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Minimum rating</Label>
        <Select
          value={rating || "all"}
          onValueChange={(value) =>
            updateParams({ rating: value === "all" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any rating</SelectItem>
            {RATING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleApply}>
          Apply Filters
        </Button>
        <Button variant="outline" size="icon" onClick={handleClear} aria-label="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ShopFilters({ categories, brands, className }: ShopFiltersProps) {
  const { searchParams } = useFilterParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;
    if (searchParams.get("category")) count++;
    if (searchParams.get("brand")) count++;
    if (searchParams.get("minPrice")) count++;
    if (searchParams.get("maxPrice")) count++;
    if (searchParams.get("rating")) count++;
    return count;
  }, [searchParams]);

  return (
    <>
      <aside className={cn("hidden w-64 shrink-0 lg:block", className)}>
        <div className="sticky top-24 space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Filters</h2>
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {activeCount}
              </Badge>
            )}
          </div>
          <Separator />
          <FilterFields categories={categories} brands={brands} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterFields
              categories={categories}
              brands={brands}
              onApply={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface ShopResultsProps {
  products: ProductCardData[];
  total: number;
  page: number;
  totalPages: number;
}

export function ShopResults({
  products,
  total,
  page,
  totalPages,
}: ShopResultsProps) {
  const { searchParams, updateParams } = useFilterParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const rawSort = searchParams.get("sort") ?? "newest";
  const sort = productSortOptions.includes(
    rawSort as (typeof productSortOptions)[number]
  )
    ? (rawSort as (typeof productSortOptions)[number])
    : "newest";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
          {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
        </p>

        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productSortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-md border">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">No products found.</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductListRow key={product.id} product={product} />
            ))
          )}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      <ShopPagination page={page} totalPages={totalPages} />
    </div>
  );
}

function ProductListRow({ product }: { product: ProductCardData }) {
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <div className="flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="128px"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <Link
            href={`/product/${product.slug}`}
            className="font-medium hover:text-primary"
          >
            {product.title}
          </Link>
          {product.rating != null && (
            <p className="mt-1 text-xs text-muted-foreground">
              {product.rating.toFixed(1)} ★
              {product.reviewCount != null && ` (${product.reviewCount} reviews)`}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {product.discountPrice != null &&
              product.discountPrice < product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
          </div>
          <Button asChild size="sm">
            <Link href={`/product/${product.slug}`}>View Product</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


interface ShopPaginationProps {
  page: number;
  totalPages: number;
}

export function ShopPagination({ page, totalPages }: ShopPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-8">
      <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? (
          <Link href={createPageUrl(page - 1)}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={createPageUrl(page + 1)}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  );
}
