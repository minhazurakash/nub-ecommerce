"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/store/hooks";
import { addToCart, setCartOpen } from "@/modules/cart/cartSlice";

type BuyAgainItem = {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  size?: string | null;
  color?: string | null;
};

type BuyAgainButtonProps = {
  items: BuyAgainItem[];
  disabled?: boolean;
  className?: string;
};

export function BuyAgainButton({ items, disabled, className }: BuyAgainButtonProps) {
  const dispatch = useAppDispatch();

  function handleBuyAgain() {
    if (items.length === 0) {
      toast.error("No items available to reorder");
      return;
    }

    items.forEach((item) => {
      dispatch(
        addToCart({
          productId: item.productId,
          title: item.title,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          variantId: item.variantId,
          size: item.size ?? undefined,
          color: item.color ?? undefined,
        })
      );
    });

    dispatch(setCartOpen(true));
    toast.success(
      items.length === 1
        ? "Item added to cart"
        : `${items.length} items added to cart`
    );
  }

  return (
    <Button
      onClick={handleBuyAgain}
      disabled={disabled || items.length === 0}
      className={cn("w-full sm:w-auto", className)}
    >
      <ShoppingBag className="h-4 w-4" />
      Buy again
    </Button>
  );
}
