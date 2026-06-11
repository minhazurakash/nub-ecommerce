"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
import { formatDbError } from "@/lib/supabase/errors";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/actions";

export type CategoryFormState = {
  error?: string;
  success?: boolean;
};

export async function saveCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const slugInput = (formData.get("slug") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const parentIdRaw = formData.get("parentId") as string;
  const parentId = parentIdRaw && parentIdRaw !== "none" ? parentIdRaw : null;

  if (!name) return { error: "Category name is required." };

  const slug = slugInput || slugify(name);
  if (id && parentId === id) {
    return { error: "A category cannot be its own parent." };
  }

  const db = getDb();
  const data = {
    name,
    slug,
    image_url: imageUrl,
    sort_order: sortOrder,
    parent_id: parentId,
  };

  try {
    if (id) {
      const { error } = await db.from("categories").update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("categories").insert(data);
      if (error) throw error;
    }
  } catch (error) {
    return {
      error: formatDbError(error, "Failed to save category. Slug may already exist."),
    };
  }

  revalidatePath("/console/categories");
  redirect("/console/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();

  const { count: productCount } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .or(`category_id.eq.${id},subcategory_id.eq.${id}`);

  if (productCount && productCount > 0) {
    redirect("/console/categories?error=has-products");
  }

  const { count: childCount } = await db
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id);

  if (childCount && childCount > 0) {
    redirect("/console/categories?error=has-children");
  }

  try {
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) throw error;
  } catch {
    redirect("/console/categories?error=delete-failed");
  }

  revalidatePath("/console/categories");
  redirect("/console/categories");
}
