export const theme = {
  colors: {
    primary: "#4F46E5",
    primaryDark: "#3730A3",
    primaryLight: "#818CF8",
    accent: "#7C3AED",
    sale: "#EF4444",
    deal: "#F59E0B",
    success: "#10B981",
  },
  fonts: {
    sans: "var(--font-inter)",
    display: "var(--font-poppins)",
  },
} as const;

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const PRODUCT_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Beige", hex: "#D4C4A8" },
] as const;
