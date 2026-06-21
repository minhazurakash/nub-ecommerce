"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Grape,
  Tag,
  Image,
} from "lucide-react";
import { Role } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/console", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/console/products", label: "Products", icon: Package },
  { href: "/console/categories", label: "Categories", icon: FolderTree },
  { href: "/console/orders", label: "Orders", icon: ShoppingCart },
  { href: "/console/coupons", label: "Discounts", icon: Tag },
  { href: "/console/banners", label: "Banners", icon: Image },
  { href: "/console/users", label: "Users", icon: Users },
] as const;

const editorNavItems = [
  { href: "/console/products", label: "Products", icon: Package },
  { href: "/console/categories", label: "Categories", icon: FolderTree },
] as const;

type ConsoleSidebarProps = {
  role: Role;
  className?: string;
};

export function ConsoleSidebar({ role, className }: ConsoleSidebarProps) {
  const pathname = usePathname();
  const navItems = role === Role.ADMIN ? adminNavItems : editorNavItems;

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-card",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Grape className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none">Blueberry</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium capitalize text-foreground">
            {role.toLowerCase()}
          </span>
        </p>
      </div>
    </aside>
  );
}
