"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
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

    revalidatePath("/console/categories");
    redirect("/console/categories");
  } catch {
    return { error: "Failed to save category. Slug may already exist." };
  }
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();
  try {
    await db.from("categories").delete().eq("id", id);
    revalidatePath("/console/categories");
    redirect("/console/categories");
  } catch {
    redirect("/console/categories?error=delete-failed");
  }
}
