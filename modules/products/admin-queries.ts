import { getDb } from "@/lib/supabase/db";
import { mapBrand, mapCategory, mapProduct, mapProductImage, mapTag } from "@/lib/supabase/mappers";
import type { Brand, Category, Product, ProductImage } from "@/lib/types/database";

export async function getAdminProducts() {
  const db = getDb();
  const { data } = await db
    .from("products")
    .select("*, categories!products_category_id_fkey(name), brands(name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const product = mapProduct(row);
    return {
      ...product,
      category: { name: row.categories?.name ?? "—" },
      brand: row.brands ? { name: row.brands.name } : null,
    };
  });
}

export async function getProductForEdit(id: string) {
  const db = getDb();
  const { data } = await db
    .from("products")
    .select("*, product_images(*), product_tags(tags(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const product = mapProduct(data);
  const images = (data.product_images ?? []).map(mapProductImage);
  const tags = (data.product_tags ?? []).map((pt: { tags: unknown }) => ({
    tag: mapTag(pt.tags),
  }));

  return { ...product, images, tags };
}

export async function getProductFormOptions(): Promise<{
  categories: Category[];
  brands: Brand[];
}> {
  const db = getDb();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    db.from("categories").select("*").order("sort_order").order("name"),
    db.from("brands").select("*").order("name"),
  ]);

  return {
    categories: (categories ?? []).map(mapCategory),
    brands: (brands ?? []).map(mapBrand),
  };
}

export type ProductWithTags = Product & {
  tags?: { tag: { name: string } }[];
  images?: ProductImage[];
};
