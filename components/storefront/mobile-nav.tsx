"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  LogIn,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setMobileNavOpen } from "@/modules/ui/uiSlice";
import { selectWishlistCount } from "@/modules/wishlist/wishlistSlice";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
];

export function MobileNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileNavOpen);
  const wishlistCount = useAppSelector(selectWishlistCount);

  const handleOpenChange = (value: boolean) => {
    dispatch(setMobileNavOpen(value));
  };

  const close = () => handleOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="w-full max-w-xs">
        <SheetHeader>
          <SheetTitle className="brand-wordmark text-left text-xl">
            Blueberry
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="flex flex-col gap-1">
          <Link
            href="/wishlist"
            onClick={close}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Heart className="h-5 w-5" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            onClick={close}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <User className="h-5 w-5" />
            Account
          </Link>
          <Link
            href="/login"
            onClick={close}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Link>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between px-3">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>

        <div className="mt-6 px-3">
          <Button asChild className="w-full gap-2" onClick={close}>
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
