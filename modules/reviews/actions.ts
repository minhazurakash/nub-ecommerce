"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/supabase/db";
import { createReviewSchema } from "@/lib/validations/review";
import { requireRoleAdmin, requireUser } from "@/modules/auth/actions";
import {
  getUserReviewForProduct,
  recomputeProductRating,
  userHasPurchasedProduct,
} from "@/modules/reviews/queries";

export async function createReview(input: {
  productId: string;
  rating: number;
  comment: string;
}) {
  const user = await requireUser();
  const parsed = createReviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.errors[0]?.message ?? "Invalid review.",
    };
  }

  const { productId, rating, comment } = parsed.data;
  const db = getDb();

  const { data: product } = await db
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false as const, error: "Product not found." };
  }

  const purchased = await userHasPurchasedProduct(user.id, productId);
  if (!purchased) {
    return {
      success: false as const,
      error: "You can only review products you have purchased.",
    };
  }

  const existing = await getUserReviewForProduct(user.id, productId);
  if (existing) {
    return {
      success: false as const,
      error: "You have already reviewed this product.",
    };
  }

  const { error } = await db.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false as const,
        error: "You have already reviewed this product.",
      };
    }
    return { success: false as const, error: error.message };
  }

  await recomputeProductRating(productId);

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/shop");
  revalidatePath("/console/reviews");

  return { success: true as const };
}

export async function deleteReview(reviewId: string) {
  await requireRoleAdmin();

  if (!reviewId) {
    return { success: false as const, error: "Invalid review." };
  }

  const db = getDb();
  const { data: review } = await db
    .from("reviews")
    .select("id, product_id, products(slug)")
    .eq("id", reviewId)
    .maybeSingle();

  if (!review) {
    return { success: false as const, error: "Review not found." };
  }

  const { error } = await db.from("reviews").delete().eq("id", reviewId);
  if (error) {
    return { success: false as const, error: error.message };
  }

  await recomputeProductRating(review.product_id);

  const slug = (
    review.products as { slug: string } | { slug: string }[] | null
  );
  const productSlug = Array.isArray(slug) ? slug[0]?.slug : slug?.slug;

  if (productSlug) {
    revalidatePath(`/product/${productSlug}`);
  }
  revalidatePath("/shop");
  revalidatePath("/console/reviews");

  return { success: true as const };
}
