import {
  Home,
  Info,
  Mail,
  Store,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type StorefrontNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const storefrontNavLinks: StorefrontNavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/shop?deals=true", label: "Deals", icon: Tag },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function isStorefrontNavActive(
  href: string,
  pathname: string,
  search = ""
): boolean {
  if (href === "/") return pathname === "/";

  if (href === "/shop?deals=true") {
    return pathname === "/shop" && search.includes("deals=true");
  }

  if (href === "/shop") {
    return (
      (pathname === "/shop" && !search.includes("deals=true")) ||
      pathname.startsWith("/product/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
