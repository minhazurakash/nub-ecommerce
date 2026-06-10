import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  discountPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const WISHLIST_KEY = "blueberry-wishlist";

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [] as WishlistItem[] },
  reducers: {
    hydrateWishlist(state) {
      state.items = loadWishlist();
    },
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(
        (i) => i.productId === action.payload.productId
      );
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
      saveWishlist(state.items);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (i) => i.productId !== action.payload
      );
      saveWishlist(state.items);
    },
  },
});

export const { hydrateWishlist, toggleWishlist, removeFromWishlist } =
  wishlistSlice.actions;

export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;
export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;
export const selectIsInWishlist =
  (productId: string) => (state: { wishlist: WishlistState }) =>
    state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;
