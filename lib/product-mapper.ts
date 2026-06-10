import type { ProductCardData } from "@/components/storefront/product-card";

export function toProductCardData(product: {
  id: string;
  title: string;
  slug: string;
  images: { url: string }[];
  price: number;
  discountPrice?: number | null;
  rating: number;
  reviewCount: number;
}): ProductCardData {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image:
      product.images[0]?.url ??
      `https://picsum.photos/seed/${product.id}/400/400`,
    price: Number(product.price),
    discountPrice: product.discountPrice
      ? Number(product.discountPrice)
      : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };
}
