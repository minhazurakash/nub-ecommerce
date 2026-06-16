export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FLAT = "FLAT",
}

export type User = {
  id: string;
  authId: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isDeal: boolean;
  categoryId: string;
  subcategoryId: string | null;
  brandId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  productId: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  sku: string;
  stock: number;
  priceDelta: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  amount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  maxUses: number | null;
  usedCount: number;
  minOrderAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  shippingAddress: Record<string, string>;
  placedAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productTitle: string;
  productImage: string | null;
  variantSnapshot: Record<string, unknown> | null;
};
