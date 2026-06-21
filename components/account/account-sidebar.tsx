"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AccountMobileNav,
  ACCOUNT_NAV_ITEMS,
  isAccountNavActive,
} from "./account-mobile-nav";

type AccountSidebarProps = {
  className?: string;
};

export function AccountSidebar({ className }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("-mx-4 md:hidden", className)}>
        <AccountMobileNav />
      </div>

      <aside
        aria-label="Account navigation"
        className={cn("hidden w-56 shrink-0 md:block", className)}
      >
        <nav className="flex flex-col gap-1">
          {ACCOUNT_NAV_ITEMS.map((item) => {
            const active = isAccountNavActive(pathname, item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
