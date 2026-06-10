"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/modules/cart/cartSlice";
import {
  selectIsInWishlist,
  toggleWishlist,
} from "@/modules/wishlist/wishlistSlice";
import { setQuickViewSlug } from "@/modules/ui/uiSlice";
import { cn, formatPrice } from "@/lib/utils";

interface QuickViewProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: { url: string; alt?: string | null }[];
  brandName?: string;
  categoryName?: string;
  categorySlug?: string;
  variants: {
    id: string;
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    stock: number;
    priceDelta: number;
  }[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ProductQuickView() {
  const dispatch = useAppDispatch();
  const slug = useAppSelector((state) => state.ui.quickViewSlug);
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const inWishlist = useAppSelector(
    selectIsInWishlist(product?.id ?? "")
  );

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setError(false);
      setQuantity(1);
      setSelectedSize(null);
      setSelectedColor(null);
      setActiveImage(0);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setProduct(null);

    fetch(`/api/products/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<QuickViewProduct>;
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  const sizes = useMemo(
    () =>
      [...new Set(product?.variants.map((v) => v.size).filter(Boolean))] as string[],
    [product?.variants]
  );

  const colors = useMemo(() => {
    if (!product) return [];
    return product.variants
      .filter((v) => !selectedSize || v.size === selectedSize)
      .reduce(
        (acc, v) => {
          if (v.color && !acc.some((c) => c.name === v.color)) {
            acc.push({ name: v.color, hex: v.colorHex });
          }
          return acc;
        },
        [] as { name: string; hex?: string | null }[]
      );
  }, [product, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (!product || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v) =>
          (!selectedSize || v.size === selectedSize) &&
          (!selectedColor || v.color === selectedColor)
      ) ?? null
    );
  }, [product, selectedSize, selectedColor]);

  const handleOpenChange = (open: boolean) => {
    if (!open) dispatch(setQuickViewSlug(null));
  };

  const handleAddToCart = () => {
    if (!product) return;
    const needsVariant = product.variants.length > 0 && !selectedVariant;
    if (needsVariant) {
      toast.error("Please select all options");
      return;
    }
    const availableStock = selectedVariant?.stock ?? product.stock;
    if (availableStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.images[0]?.url ?? "",
        price: product.price + (selectedVariant?.priceDelta ?? 0),
        discountPrice: product.discountPrice
          ? product.discountPrice + (selectedVariant?.priceDelta ?? 0)
          : undefined,
        quantity,
        variantId: selectedVariant?.id,
        size: selectedVariant?.size ?? undefined,
        color: selectedVariant?.color ?? undefined,
      })
    );
    toast.success("Added to cart");
    dispatch(setQuickViewSlug(null));
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(
      toggleWishlist({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.images[0]?.url ?? "",
        price: product.price,
        discountPrice: product.discountPrice,
      })
    );
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const displayPrice = product
    ? (product.discountPrice ?? product.price) +
      (selectedVariant?.priceDelta ?? 0)
    : 0;
  const hasDiscount =
    product != null &&
    product.discountPrice != null &&
    product.discountPrice < product.price;
  const availableStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const needsVariantSelection =
    (product?.variants.length ?? 0) > 0 && !selectedVariant;

  return (
    <Dialog open={!!slug} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">
          {product?.title ?? "Product quick view"}
        </DialogTitle>

        <div className="p-6">
          {loading && <QuickViewSkeleton />}

          {error && !loading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Could not load product.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => dispatch(setQuickViewSlug(null))}
              >
                Close
              </Button>
            </div>
          )}

          {product && !loading && (
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={
                      product.images[activeImage]?.url ??
                      product.images[0]?.url ??
                      "/placeholder.svg"
                    }
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover"
                  />
                  {hasDiscount && (
                    <Badge variant="warning" className="absolute left-3 top-3">
                      Sale
                    </Badge>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((img, i) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={cn(
                          "relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                          i === activeImage
                            ? "border-primary"
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt ?? product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap gap-2">
                  {product.categoryName && (
                    <Badge variant="secondary">{product.categoryName}</Badge>
                  )}
                  {product.brandName && (
                    <Badge variant="outline">{product.brandName}</Badge>
                  )}
                </div>

                <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-xl font-bold leading-tight sm:text-2xl">
                  {product.title}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviewCount})
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatPrice(
                        product.price + (selectedVariant?.priceDelta ?? 0)
                      )}
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {product.description
                      .replace(/<[^>]*>/g, "")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                )}

                {sizes.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-medium">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedSize(size);
                            setSelectedColor(null);
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {colors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <Button
                          key={color.name}
                          variant={
                            selectedColor === color.name ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedColor(color.name)}
                          className="gap-2"
                        >
                          {color.hex && (
                            <span
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          {color.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex items-center rounded-lg border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() =>
                        setQuantity((q) => Math.min(availableStock, q + 1))
                      }
                      aria-label="Increase quantity"
                      disabled={quantity >= availableStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {availableStock > 0
                      ? `${availableStock} in stock`
                      : "Out of stock"}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={availableStock <= 0 || needsVariantSelection}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={handleToggleWishlist}>
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4",
                        inWishlist && "fill-destructive text-destructive"
                      )}
                    />
                    Wishlist
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="mt-3 w-full text-primary"
                  asChild
                >
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => dispatch(setQuickViewSlug(null))}
                  >
                    View full details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
