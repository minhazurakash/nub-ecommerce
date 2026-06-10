"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  removeFromCart,
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
  setCartOpen,
  updateQuantity,
} from "@/modules/cart/cartSlice";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCartOpen);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);

  const handleOpenChange = (value: boolean) => {
    dispatch(setCartOpen(value));
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add items to get started
              </p>
            </div>
            <Button asChild onClick={() => handleOpenChange(false)}>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const linePrice = item.discountPrice ?? item.price;
                  return (
                    <motion.div
                      key={`${item.productId}-${item.variantId ?? "default"}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => handleOpenChange(false)}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => handleOpenChange(false)}
                          className="line-clamp-2 text-sm font-medium hover:text-primary"
                        >
                          {item.title}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[item.size, item.color].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatPrice(linePrice)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.productId,
                                    variantId: item.variantId,
                                    quantity: item.quantity - 1,
                                  })
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.productId,
                                    variantId: item.variantId,
                                    quantity: item.quantity + 1,
                                  })
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  productId: item.productId,
                                  variantId: item.variantId,
                                })
                              )
                            }
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className={cn("text-lg font-semibold")}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Separator />
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout" onClick={() => handleOpenChange(false)}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOpenChange(false)}
                asChild
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
