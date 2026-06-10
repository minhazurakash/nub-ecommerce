"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export function isAccountNavActive(
  pathname: string,
  href: string,
  exact?: boolean
) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AccountMobileNavProps = {
  items?: AccountNavItem[];
  className?: string;
};

export function AccountMobileNav({
  items = ACCOUNT_NAV_ITEMS,
  className,
}: AccountMobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className={cn(
        "flex gap-1 overflow-x-auto border-b pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {items.map((item) => {
        const active = isAccountNavActive(pathname, item.href, item.exact);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
