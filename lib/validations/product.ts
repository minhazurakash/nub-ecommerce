import { OrderStatus } from "@/lib/types/database";
import { z } from "zod";

export const productSortOptions = [
  "newest",
  "popular",
  "price_asc",
  "price_desc",
  "rating",
  "title",
] as const;

export type ProductSort = (typeof productSortOptions)[number];

const queryBoolean = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => value === true || value === "true");

export const productFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(productSortOptions).optional().default("newest"),
  featured: queryBoolean,
  deals: queryBoolean,
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  discountPrice: z.coerce
    .number()
    .positive("Discount price must be greater than zero")
    .optional()
    .nullable(),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isDeal: z.boolean().optional().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0),
  parentId: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required").default("Home"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required").default("US"),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  variantId: z.string().optional(),
});

export const orderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type OrderStatusInput = z.infer<typeof orderSchema>;

export const shippingAddressSchema = addressSchema.omit({ isDefault: true });

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
