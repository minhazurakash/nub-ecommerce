import type { Category } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { mapCategory } from "@/lib/supabase/mappers";

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export async function getCategories(): Promise<Category[]> {
  const db = getDb();
  const { data } = await db
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (data ?? []).map(mapCategory);
}

function buildCategoryTree(
  categories: Category[],
  parentId: string | null = null
): CategoryTreeNode[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }));
}

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await getCategories();
  return buildCategoryTree(categories);
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const { data } = await db
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const category = mapCategory(data);
  const { data: children } = await db
    .from("categories")
    .select("*")
    .eq("parent_id", category.id)
    .order("sort_order", { ascending: true });

  const { count } = await db
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category.id);

  return {
    ...category,
    children: (children ?? []).map(mapCategory),
    _count: { products: count ?? 0 },
  };
}

export type CategoryWithProductCount = Category & {
  _count: { products: number };
};

export async function getTopLevelCategories(): Promise<CategoryWithProductCount[]> {
  const db = getDb();
  const { data } = await db
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories = (data ?? []).map(mapCategory);
  const result: CategoryWithProductCount[] = [];

  for (const cat of categories) {
    const { count } = await db
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", cat.id);
    result.push({ ...cat, _count: { products: count ?? 0 } });
  }

  return result;
}
