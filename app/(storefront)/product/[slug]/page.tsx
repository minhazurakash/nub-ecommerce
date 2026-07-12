import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { type ProductCardData } from "@/components/storefront/product-card";
import {
  getProductBySlug,
  getProducts,
  type ProductListItem,
} from "@/modules/products/queries";
import {
  getProductReviewCount,
  getProductReviews,
  getUserReviewForProduct,
  userHasPurchasedProduct,
} from "@/modules/reviews/queries";
import { getCurrentUser } from "@/modules/auth/actions";

function toProductCardData(product: ProductListItem): ProductCardData {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image: product.images[0]?.url ?? "/placeholder.svg",
    price: Number(product.price),
    discountPrice: product.discountPrice
      ? Number(product.discountPrice)
      : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const user = await getCurrentUser();

  const [reviews, reviewCount, relatedResult, hasPurchased, existingReview] =
    await Promise.all([
      getProductReviews(product.id),
      getProductReviewCount(product.id),
      getProducts({
        category: product.category.slug,
        limit: 5,
      }),
      user ? userHasPurchasedProduct(user.id, product.id) : Promise.resolve(false),
      user
        ? getUserReviewForProduct(user.id, product.id)
        : Promise.resolve(null),
    ]);

  const relatedProducts = relatedResult.products
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map(toProductCardData);

  const primaryImage = product.images[0]?.url ?? "/placeholder.svg";

  const reviewEligibility = {
    isLoggedIn: !!user,
    hasPurchased,
    hasExistingReview: !!existingReview,
  };

  const mappedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.createdAt).toISOString(),
    userName: r.user.name ?? "Anonymous",
  }));

  const productPayload = {
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
    reviewCount,
    image: primaryImage,
    brandName: product.brand?.name,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
  };

  return (
    <div className="container-custom py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <ProductDetailClient
          section="purchase"
          product={productPayload}
          variants={product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            priceDelta: Number(v.priceDelta),
          }))}
          reviews={mappedReviews}
          relatedProducts={relatedProducts}
        />
      </div>

      <div className="mt-12">
        <ProductDetailClient
          section="details"
          product={productPayload}
          variants={[]}
          reviews={mappedReviews}
          relatedProducts={relatedProducts}
          reviewEligibility={reviewEligibility}
        />
      </div>
    </div>
  );
}
