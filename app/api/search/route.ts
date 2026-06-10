import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/modules/products/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  try {
    const result = await searchProducts(query, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    const products = result.products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      image: product.images[0]?.url ?? "",
      price: Number(product.price),
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : undefined,
    }));

    return NextResponse.json({
      products,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch {
    return NextResponse.json(
      { error: "Search failed", products: [] },
      { status: 500 }
    );
  }
}
