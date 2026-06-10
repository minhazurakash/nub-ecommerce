export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { SearchCommand } from "@/components/storefront/search-command";
import { TopBar } from "@/components/storefront/top-bar";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-8 md:flex-row">
            <AccountSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <SearchCommand />
      <MobileNav />
    </div>
  );
}
