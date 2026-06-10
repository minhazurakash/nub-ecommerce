"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/actions";

export type ProductFormState = {
  error?: string;
  success?: boolean;
};

export async function saveProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const price = parseFloat(formData.get("price") as string);
  const discountPriceRaw = formData.get("discountPrice") as string;
  const discountPrice = discountPriceRaw ? parseFloat(discountPriceRaw) : null;
  const categoryId = formData.get("categoryId") as string;
  const subcategoryId = (formData.get("subcategoryId") as string) || null;
  const brandId = (formData.get("brandId") as string) || null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const sku = (formData.get("sku") as string)?.trim();
  const tagsRaw = (formData.get("tags") as string)?.trim();
  const isFeatured = formData.get("isFeatured") === "on";
  const isDeal = formData.get("isDeal") === "on";
  const imagesJson = (formData.get("images") as string) || "[]";

  let images: { url: string; alt?: string }[] = [];
  try {
    images = JSON.parse(imagesJson);
  } catch {
    images = [];
  }

  if (!title || !description || !categoryId || !sku || Number.isNaN(price) || Number.isNaN(stock)) {
    return { error: "Please fill in all required fields." };
  }

  const slug = slugify(title);
  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const db = getDb();
  const productData = {
    title,
    slug,
    description,
    price,
    discount_price: discountPrice,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    brand_id: brandId,
    stock,
    sku,
    is_featured: isFeatured,
    is_deal: isDeal,
  };

  try {
    let productId = id;

    if (id) {
      const { error } = await db.from("products").update(productData).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await db
        .from("products")
        .insert(productData)
        .select("id")
        .single();
      if (error || !data) throw error;
      productId = data.id;
    }

    if (!productId) throw new Error("Product save failed");

    if (tagNames.length > 0) {
      await db.from("product_tags").delete().eq("product_id", productId);
      for (const name of tagNames) {
        const tagSlug = slugify(name);
        const { data: existingTag } = await db
          .from("tags")
          .select("id")
          .eq("slug", tagSlug)
          .maybeSingle();

        let tagId = existingTag?.id;
        if (!tagId) {
          const { data: newTag } = await db
            .from("tags")
            .insert({ name, slug: tagSlug })
            .select("id")
            .single();
          tagId = newTag?.id;
        }
        if (tagId) {
          await db.from("product_tags").insert({ product_id: productId, tag_id: tagId });
        }
      }
    }

    await db.from("product_images").delete().eq("product_id", productId);
    if (images.length > 0) {
      await db.from("product_images").insert(
        images.map((img, index) => ({
          product_id: productId,
          url: img.url,
          alt: img.alt || title,
          sort_order: index,
        }))
      );
    }

    revalidatePath("/console/products");
    redirect("/console/products");
  } catch {
    return { error: "Failed to save product. Check SKU and slug uniqueness." };
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();
  try {
    await db.from("products").delete().eq("id", id);
    revalidatePath("/console/products");
    redirect("/console/products");
  } catch {
    redirect("/console/products?error=delete-failed");
  }
}
