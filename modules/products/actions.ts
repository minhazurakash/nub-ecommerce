"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
import { formatDbError } from "@/lib/supabase/errors";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/actions";

export type ProductFormState = {
  error?: string;
  success?: boolean;
};

async function resolveUniqueSlug(
  db: ReturnType<typeof getDb>,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    let query = db.from("products").select("id").eq("slug", slug);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();
    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

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
    return { error: "Please fill in all required fields, including category." };
  }

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const db = getDb();

  try {
    let slug = slugify(title);

    if (id) {
      const { data: existing } = await db
        .from("products")
        .select("slug, title")
        .eq("id", id)
        .maybeSingle();

      if (existing && slugify(existing.title) === slug) {
        slug = existing.slug;
      } else {
        slug = await resolveUniqueSlug(db, slug, id);
      }
    } else {
      slug = await resolveUniqueSlug(db, slug);
    }

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
      if (error || !data) throw error ?? new Error("Product insert failed");
      productId = data.id;
    }

    if (!productId) throw new Error("Product save failed");

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
        const { data: newTag, error: tagError } = await db
          .from("tags")
          .insert({ name, slug: tagSlug })
          .select("id")
          .single();
        if (tagError) throw tagError;
        tagId = newTag?.id;
      }

      if (tagId) {
        const { error: linkError } = await db
          .from("product_tags")
          .insert({ product_id: productId, tag_id: tagId });
        if (linkError) throw linkError;
      }
    }

    await db.from("product_images").delete().eq("product_id", productId);
    if (images.length > 0) {
      const { error: imagesError } = await db.from("product_images").insert(
        images.map((img, index) => ({
          product_id: productId,
          url: img.url,
          alt: img.alt || title,
          sort_order: index,
        }))
      );
      if (imagesError) throw imagesError;
    }
  } catch (error) {
    return {
      error: formatDbError(
        error,
        "Failed to save product. Check SKU and slug uniqueness."
      ),
    };
  }

  revalidatePath("/console/products");
  redirect("/console/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();

  try {
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw error;
  } catch {
    redirect("/console/products?error=delete-failed");
  }

  revalidatePath("/console/products");
  redirect("/console/products");
}
