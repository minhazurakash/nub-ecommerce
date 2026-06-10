import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  searchOpen: boolean;
  mobileNavOpen: boolean;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: { searchOpen: false, mobileNavOpen: false } as UiState,
  reducers: {
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const { setSearchOpen, setMobileNavOpen } = uiSlice.actions;
export default uiSlice.reducer;
