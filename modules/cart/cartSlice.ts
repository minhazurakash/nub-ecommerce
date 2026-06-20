import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const CART_KEY = "blueberry-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state) {
      state.items = loadCart();
    },
    addToCart(
      state,
      action: PayloadAction<CartItem & { openDrawer?: boolean }>
    ) {
      const { openDrawer = true, ...item } = action.payload;
      const existing = state.items.find(
        (i) =>
          i.productId === item.productId && i.variantId === item.variantId
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      saveCart(state.items);
      state.isOpen = openDrawer;
    },
    removeFromCart(
      state,
      action: PayloadAction<{ productId: string; variantId?: string }>
    ) {
      state.items = state.items.filter(
        (i) =>
          !(
            i.productId === action.payload.productId &&
            i.variantId === action.payload.variantId
          )
      );
      saveCart(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>
    ) {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.variantId === action.payload.variantId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i !== item);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartOpen,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
    0
  );
export const selectCartOpen = (state: { cart: CartState }) => state.cart.isOpen;

export default cartSlice.reducer;
