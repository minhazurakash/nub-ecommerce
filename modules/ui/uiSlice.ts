import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  searchOpen: boolean;
  mobileNavOpen: boolean;
  quickViewSlug: string | null;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    searchOpen: false,
    mobileNavOpen: false,
    quickViewSlug: null,
  } as UiState,
  reducers: {
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    setQuickViewSlug(state, action: PayloadAction<string | null>) {
      state.quickViewSlug = action.payload;
    },
  },
});

export const { setSearchOpen, setMobileNavOpen, setQuickViewSlug } =
  uiSlice.actions;
export default uiSlice.reducer;
