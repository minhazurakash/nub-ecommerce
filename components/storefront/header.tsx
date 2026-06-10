"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount, setCartOpen } from "@/modules/cart/cartSlice";
import { selectWishlistCount } from "@/modules/wishlist/wishlistSlice";
import { setMobileNavOpen, setSearchOpen } from "@/modules/ui/uiSlice";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?deals=true", label: "Deals" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex h-16 items-center gap-4 lg:h-[4.75rem]">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => dispatch(setMobileNavOpen(true))}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight lg:text-2xl"
          >
          <span className="brand-wordmark">Blueberry</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-1.5 py-1">
              {navLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : link.href === "/shop"
                      ? pathname === "/shop"
                      : pathname.startsWith(link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => dispatch(setSearchOpen(true))}
            className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 lg:flex xl:max-w-sm"
            aria-label="Search products"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search products...</span>
            <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => dispatch(setSearchOpen(true))}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden items-center gap-0.5 rounded-full border border-border/60 bg-muted/30 p-0.5 sm:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label="Account menu"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login">Sign In</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
                asChild
                aria-label="Wishlist"
              >
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" />
                  <CountBadge count={wishlistCount} />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
                onClick={() => dispatch(setCartOpen(true))}
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4" />
                <CountBadge count={cartCount} />
              </Button>

              <ThemeToggle className="h-9 w-9 rounded-full" />
            </div>

            <div className="flex items-center gap-0.5 sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                asChild
                aria-label="Wishlist"
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <CountBadge count={wishlistCount} />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => dispatch(setCartOpen(true))}
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                <CountBadge count={cartCount} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
