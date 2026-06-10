"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/storefront/product-grid";
import { type ProductCardData } from "@/components/storefront/product-card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/modules/cart/cartSlice";
import {
  selectIsInWishlist,
  toggleWishlist,
} from "@/modules/wishlist/wishlistSlice";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductVariant {
  id: string;
  size?: string | null;
  color?: string | null;
  colorHex?: string | null;
  stock: number;
  priceDelta: number;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    rating: number;
    reviewCount: number;
    image: string;
    brandName?: string;
    categoryName?: string;
    categorySlug?: string;
  };
  variants: ProductVariant[];
  reviews: ProductReview[];
  relatedProducts: ProductCardData[];
  section?: "purchase" | "details" | "all";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function ProductDetailClient({
  product,
  variants,
  reviews,
  relatedProducts,
  section = "all",
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(selectIsInWishlist(product.id));
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[],
    [variants]
  );

  const colors = useMemo(
    () =>
      variants
        .filter((v) => !selectedSize || v.size === selectedSize)
        .reduce(
          (acc, v) => {
            if (v.color && !acc.some((c) => c.name === v.color)) {
              acc.push({ name: v.color, hex: v.colorHex });
            }
            return acc;
          },
          [] as { name: string; hex?: string | null }[]
        ),
    [variants, selectedSize]
  );

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return (
      variants.find(
        (v) =>
          (!selectedSize || v.size === selectedSize) &&
          (!selectedColor || v.color === selectedColor)
      ) ?? null
    );
  }, [variants, selectedSize, selectedColor]);

  const displayPrice =
    (product.discountPrice ?? product.price) +
    (selectedVariant?.priceDelta ?? 0);
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const availableStock = selectedVariant?.stock ?? product.stock;
  const needsVariantSelection = variants.length > 0 && !selectedVariant;

  const handleAddToCart = () => {
    if (needsVariantSelection) {
      toast.error("Please select all options");
      return;
    }
    if (availableStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.image,
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
  };

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlist({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.image,
        price: product.price,
        discountPrice: product.discountPrice,
      })
    );
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="space-y-8">
      {(section === "purchase" || section === "all") && (
        <>
      {(product.brandName || product.categoryName) && (
            <div className="flex flex-wrap gap-2">
              {product.categoryName && (
                <Badge variant="secondary">{product.categoryName}</Badge>
              )}
              {product.brandName && (
                <Badge variant="outline">{product.brandName}</Badge>
              )}
            </div>
          )}

          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold sm:text-3xl">
            {product.title}
          </h1>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price + (selectedVariant?.priceDelta ?? 0))}
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="space-y-2">
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.name}
                    variant={selectedColor === color.name ? "default" : "outline"}
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

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium tabular-nums">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
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

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="flex-1 sm:flex-none"
              onClick={handleAddToCart}
              disabled={availableStock <= 0 || needsVariantSelection}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={cn(
                  "mr-2 h-4 w-4",
                  inWishlist && "fill-destructive text-destructive"
                )}
              />
              {inWishlist ? "In Wishlist" : "Add to Wishlist"}
            </Button>
          </div>
        </>
      )}

      {(section === "details" || section === "all") && (
        <>
      {section === "all" && <Separator />}

      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold">
              Related Products
            </h2>
            {product.categorySlug && (
              <Button variant="link" asChild className="px-0">
                <Link href={`/shop?category=${product.categorySlug}`}>
                  View all
                </Link>
              </Button>
            )}
          </div>
          <ProductGrid products={relatedProducts} className="lg:grid-cols-4" />
        </section>
      )}
        </>
      )}
    </div>
  );
}
