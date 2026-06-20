"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/modules/cart/cartSlice";
import {
  selectIsInWishlist,
  toggleWishlist,
} from "@/modules/wishlist/wishlistSlice";
import { setQuickViewSlug } from "@/modules/ui/uiSlice";
import { cn, formatPrice } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  /** `default` — hover actions + add to cart. `buyNow` — visible Buy Now → checkout. */
  variant?: "default" | "buyNow";
}

function StarRating({ rating = 0 }: { rating?: number }) {
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

export function ProductCard({
  product,
  className,
  variant = "default",
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(selectIsInWishlist(product.id));

  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  const cartPayload = {
    productId: product.id,
    title: product.title,
    slug: product.slug,
    image: product.image,
    price: product.price,
    discountPrice: product.discountPrice,
    quantity: 1,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(cartPayload));
    toast.success("Added to cart");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...cartPayload, openDrawer: false }));
    router.push("/checkout");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setQuickViewSlug(product.slug));
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-[border-color,background-color] duration-300 hover:border-primary/25 hover:bg-card/80",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-x-0 top-0 bottom-11 z-0 sm:bottom-12 lg:inset-0"
          aria-label={product.title}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {hasDiscount && (
          <Badge variant="warning" className="absolute left-3 top-3 z-[2]">
            -{discountPercent}%
          </Badge>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-0 px-1.5 pb-1.5 transition-transform duration-300 ease-out sm:px-2 sm:pb-2 lg:translate-y-full lg:group-hover:translate-y-0">
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-background/95 p-1 shadow-sm backdrop-blur-md sm:gap-1.5 sm:p-1.5">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 min-h-9 flex-1 sm:hidden"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="hidden h-9 min-h-9 flex-1 gap-1.5 text-xs font-medium sm:inline-flex"
              onClick={handleQuickView}
            >
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 min-h-9 w-9 min-w-9 flex-1 sm:h-9 sm:w-9 sm:min-w-9 sm:flex-none"
              onClick={variant === "buyNow" ? handleBuyNow : handleAddToCart}
              aria-label={variant === "buyNow" ? "Buy now" : "Add to cart"}
            >
              {variant === "buyNow" ? (
                <Zap className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              ) : (
                <ShoppingBag className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 min-h-9 w-9 min-w-9 flex-1 sm:h-9 sm:w-9 sm:min-w-9 sm:flex-none"
              onClick={handleToggleWishlist}
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={cn(
                  "h-4 w-4 sm:h-3.5 sm:w-3.5",
                  inWishlist && "fill-destructive text-destructive"
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/product/${product.slug}`} className="flex flex-col gap-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            {product.reviewCount != null && product.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            )}
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-base font-semibold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </Link>
        {variant === "buyNow" && (
          <Button
            type="button"
            size="sm"
            className="w-full gap-1.5"
            onClick={handleBuyNow}
          >
            <Zap className="h-3.5 w-3.5" />
            Buy Now
          </Button>
        )}
      </div>
    </article>
  );
}
