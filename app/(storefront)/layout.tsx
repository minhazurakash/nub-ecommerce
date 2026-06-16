export const dynamic = "force-dynamic";

import { TopBar } from "@/components/storefront/top-bar";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchCommand } from "@/components/storefront/search-command";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { ProductQuickView } from "@/components/storefront/product-quick-view";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header isLoggedIn={!!user} userRole={user?.role} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchCommand />
      <MobileNav isLoggedIn={!!user} userRole={user?.role} />
      <ProductQuickView />
    </div>
  );
}
