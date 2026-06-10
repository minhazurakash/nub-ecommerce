/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Address,
  Brand,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductImage,
  ProductVariant,
  Role,
  Tag,
  User,
} from "@/lib/types/database";

function num(v: unknown): number {
  return typeof v === "number" ? v : parseFloat(String(v ?? 0));
}

function bool(v: unknown): boolean {
  return v === true || v === "true";
}

export function mapUser(row: any): User {
  return {
    id: row.id,
    authId: row.auth_id,
    email: row.email,
    name: row.name ?? null,
    phone: row.phone ?? null,
    avatarUrl: row.avatar_url ?? null,
    role: row.role as Role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAddress(row: any): Address {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2 ?? null,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: bool(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url ?? null,
    sortOrder: row.sort_order ?? 0,
    parentId: row.parent_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBrand(row: any): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: num(row.price),
    discountPrice: row.discount_price != null ? num(row.discount_price) : null,
    sku: row.sku,
    stock: row.stock ?? 0,
    rating: num(row.rating),
    reviewCount: row.review_count ?? 0,
    isFeatured: bool(row.is_featured),
    isDeal: bool(row.is_deal),
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id ?? null,
    brandId: row.brand_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductImage(row: any): ProductImage {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt ?? null,
    sortOrder: row.sort_order ?? 0,
    productId: row.product_id,
  };
}

export function mapProductVariant(row: any): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size ?? null,
    color: row.color ?? null,
    colorHex: row.color_hex ?? null,
    sku: row.sku,
    stock: row.stock ?? 0,
    priceDelta: num(row.price_delta),
  };
}

export function mapTag(row: any): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

export function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    orderNumber: row.order_number,
    status: row.status as OrderStatus,
    subtotal: num(row.subtotal),
    shipping: num(row.shipping),
    tax: num(row.tax),
    total: num(row.total),
    shippingAddress: row.shipping_address as Record<string, string>,
    placedAt: row.placed_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: num(row.unit_price),
    productTitle: row.product_title,
    productImage: row.product_image ?? null,
    variantSnapshot: row.variant_snapshot ?? null,
  };
}

export function toUserInsert(user: Partial<User> & { authId: string; email: string }) {
  return {
    auth_id: user.authId,
    email: user.email,
    name: user.name ?? null,
    phone: user.phone ?? null,
    avatar_url: user.avatarUrl ?? null,
    role: user.role ?? "USER",
  };
}

export function toAddressInsert(
  userId: string,
  data: {
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
) {
  return {
    user_id: userId,
    label: data.label,
    full_name: data.fullName,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 ?? null,
    city: data.city,
    state: data.state,
    postal_code: data.postalCode,
    country: data.country,
    is_default: data.isDefault ?? false,
  };
}
