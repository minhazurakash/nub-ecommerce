"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addToCart } from "@/modules/cart/cartSlice";
import {
  removeFromWishlist,
  selectWishlistItems,
} from "@/modules/wishlist/wishlistSlice";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  const handleAddToCart = (item: (typeof items)[number]) => {
    dispatch(
      addToCart({
        productId: item.productId,
        title: item.title,
        slug: item.slug,
        image: item.image,
        price: item.price,
        discountPrice: item.discountPrice,
        quantity: 1,
      })
    );
    toast.success("Added to cart");
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold">
            Your wishlist is empty
          </h1>
          <p className="text-muted-foreground">
            Save items you love and come back to them later.
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="mb-8 font-[family-name:var(--font-poppins)] text-3xl font-bold">
        Wishlist
        <span className="ml-2 text-lg font-normal text-muted-foreground">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const displayPrice = item.discountPrice ?? item.price;
          return (
            <Card key={item.productId} className="overflow-hidden">
              <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardHeader className="pb-2">
                <Link href={`/product/${item.slug}`}>
                  <CardTitle className="line-clamp-2 text-base hover:text-primary">
                    {item.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary">
                    {formatPrice(displayPrice)}
                  </span>
                  {item.discountPrice != null &&
                    item.discountPrice < item.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    dispatch(removeFromWishlist(item.productId));
                    toast.success("Removed from wishlist");
                  }}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
