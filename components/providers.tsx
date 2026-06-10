"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { makeStore, type AppStore } from "@/lib/store";
import { hydrateCart } from "@/modules/cart/cartSlice";
import { hydrateWishlist } from "@/modules/wishlist/wishlistSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    storeRef.current?.dispatch(hydrateCart());
    storeRef.current?.dispatch(hydrateWishlist());
  }, []);

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
    </Provider>
  );
}
