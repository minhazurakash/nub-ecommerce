import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/modules/products/queries";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : undefined,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
      brandName: product.brand?.name,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        stock: v.stock,
        priceDelta: Number(v.priceDelta),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}
