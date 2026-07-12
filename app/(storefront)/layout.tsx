export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { TopBar } from "@/components/storefront/top-bar";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchCommand } from "@/components/storefront/search-command";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { ProductQuickView } from "@/components/storefront/product-quick-view";
import { getCurrentUser } from "@/modules/auth/actions";
import { getUnreadNotificationCount } from "@/modules/notifications/queries";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Suspense fallback={<div className="h-16 border-b lg:h-[4.75rem]" />}>
        <Header
          isLoggedIn={!!user}
          userRole={user?.role}
          unreadCount={unreadCount}
        />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchCommand />
      <Suspense>
        <MobileNav isLoggedIn={!!user} userRole={user?.role} />
      </Suspense>
      <ProductQuickView />
    </div>
  );
}
