"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/modules/cart/cartSlice";
import {
  selectIsInWishlist,
  toggleWishlist,
} from "@/modules/wishlist/wishlistSlice";
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

export function ProductCard({ product, className }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(selectIsInWishlist(product.id));

  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      addToCart({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: product.image,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: 1,
      })
    );
    toast.success("Added to cart");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      <Card className="group product-card-hover overflow-hidden border-border/60">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {hasDiscount && (
              <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
                -{discountPercent}%
              </Badge>
            )}
            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    inWishlist && "fill-destructive text-destructive"
                  )}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardContent className="space-y-2 p-4">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
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
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-primary">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}
