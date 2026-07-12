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
import { getUnreadNotificationCount } from "@/modules/notifications/queries";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header isLoggedIn userRole={user.role} unreadCount={unreadCount} />
      <main className="flex-1 overflow-x-hidden">
        <div className="container-custom py-4 sm:py-8">
          <div className="flex flex-col gap-4 md:gap-8 md:flex-row">
            <AccountSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <SearchCommand />
      <MobileNav isLoggedIn userRole={user.role} />
    </div>
  );
}
