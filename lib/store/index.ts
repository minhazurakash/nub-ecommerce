import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/modules/cart/cartSlice";
import wishlistReducer from "@/modules/wishlist/wishlistSlice";
import uiReducer from "@/modules/ui/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
      ui: uiReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
