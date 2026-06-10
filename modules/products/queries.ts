import {
  productFilterSchema,
  type ProductFilterInput,
  type ProductSort,
} from "@/lib/validations/product";
import { getDb } from "@/lib/supabase/db";
import {
  mapProduct,
  mapProductImage,
  mapProductVariant,
  mapTag,
} from "@/lib/supabase/mappers";
import type { ProductImage } from "@/lib/types/database";

const DEFAULT_PAGE_SIZE = 12;

const PRODUCT_LIST_SELECT = `
  *,
  product_images(url, alt, sort_order),
  categories!products_category_id_fkey(id, name, slug),
  brands(id, name, slug)
`;

const PRODUCT_DETAIL_SELECT = `
  *,
  product_images(url, alt, sort_order),
  category:categories!products_category_id_fkey(id, name, slug),
  subcategory:categories!products_subcategory_id_fkey(id, name, slug),
  brands(id, name, slug, logo_url),
  product_variants(*),
  product_tags(tags(*))
`;

export type ProductListItem = ReturnType<typeof mapProduct> & {
  images: ReturnType<typeof mapProductImage>[];
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
};

export type ProductDetail = ReturnType<typeof mapProduct> & {
  images: ReturnType<typeof mapProductImage>[];
  category: { id: string; name: string; slug: string };
  subcategory: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
  variants: ReturnType<typeof mapProductVariant>[];
  tags: { tag: ReturnType<typeof mapTag> }[];
};

export type PaginatedProducts = {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListRow(row: any): ProductListItem {
  const product = mapProduct(row);
  const images = (row.product_images ?? [])
    .map(mapProductImage)
    .sort((a: ProductImage, b: ProductImage) => a.sortOrder - b.sortOrder)
    .slice(0, 1);
  const cat = row.categories ?? row.category;
  const brand = row.brands ?? row.brand;

  return {
    ...product,
    images,
    category: cat
      ? { id: cat.id, name: cat.name, slug: cat.slug }
      : { id: "", name: "Uncategorized", slug: "uncategorized" },
    brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug } : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetailRow(row: any): ProductDetail {
  const product = mapProduct(row);
  const images = (row.product_images ?? []).map(mapProductImage).sort(
    (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder
  );
  const category = row.category ?? row.categories;
  const subcategory = row.subcategory;
  const brand = row.brands ?? row.brand;

  return {
    ...product,
    images,
    category: category
      ? { id: category.id, name: category.name, slug: category.slug }
      : { id: "", name: "Uncategorized", slug: "uncategorized" },
    subcategory: subcategory
      ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug }
      : null,
    brand: brand
      ? {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logo_url ?? null,
        }
      : null,
    variants: (row.product_variants ?? []).map(mapProductVariant),
    tags: (row.product_tags ?? []).map((pt: { tags: unknown }) => ({
      tag: mapTag(pt.tags),
    })),
  };
}

function sortColumn(sort: ProductSort): { column: string; ascending: boolean } {
  switch (sort) {
    case "price_asc":
      return { column: "price", ascending: true };
    case "price_desc":
      return { column: "price", ascending: false };
    case "rating":
      return { column: "rating", ascending: false };
    case "title":
      return { column: "title", ascending: true };
    case "popular":
      return { column: "review_count", ascending: false };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

function effectivePrice(p: ProductListItem): number {
  return p.discountPrice ?? p.price;
}

async function resolveCategoryIds(slug: string): Promise<string[]> {
  const db = getDb();
  const { data } = await db.from("categories").select("id").eq("slug", slug);
  if (!data?.length) return [];
  const ids = data.map((c) => c.id);
  const { data: children } = await db
    .from("categories")
    .select("id")
    .eq("parent_id", ids[0]);
  return [...ids, ...(children?.map((c) => c.id) ?? [])];
}

async function resolveBrandId(slug: string): Promise<string | null> {
  const db = getDb();
  const { data } = await db.from("brands").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function getProducts(
  rawFilters: Partial<ProductFilterInput> = {}
): Promise<PaginatedProducts> {
  const parsed = productFilterSchema.safeParse(rawFilters);
  const filters = parsed.success
    ? parsed.data
    : productFilterSchema.parse({});
  const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
  const page = filters.page ?? 1;
  const db = getDb();

  let query = db.from("products").select(PRODUCT_LIST_SELECT, { count: "exact" });

  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  if (filters.deals) {
    query = query.eq("is_deal", true);
  }

  if (filters.category) {
    const catIds = await resolveCategoryIds(filters.category);
    if (catIds.length) {
      query = query.or(
        `category_id.in.(${catIds.join(",")}),subcategory_id.in.(${catIds.join(",")})`
      );
    } else {
      return { products: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  if (filters.brand) {
    const brandId = await resolveBrandId(filters.brand);
    if (brandId) query = query.eq("brand_id", brandId);
    else return { products: [], total: 0, page, limit, totalPages: 1 };
  }

  if (filters.rating !== undefined) {
    query = query.gte("rating", filters.rating);
  }

  const { column, ascending } = sortColumn(filters.sort ?? "newest");
  query = query.order(column, { ascending });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  let products = (data ?? []).map(mapListRow);

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    products = products.filter((p) => {
      const price = effectivePrice(p);
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
      return true;
    });
  }

  const total = filters.minPrice !== undefined || filters.maxPrice !== undefined
    ? products.length
    : (count ?? 0);

  const start = (page - 1) * limit;
  const paged = products.slice(start, start + limit);

  return {
    products: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const db = getDb();
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapDetailRow(data);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const db = getDb();
  const { data } = await db
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map(mapListRow);
}

export async function getDealProducts(limit = 8): Promise<ProductListItem[]> {
  const db = getDb();
  const { data } = await db
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_deal", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map(mapListRow);
}

export async function searchProducts(
  query: string,
  options: { page?: number; limit?: number } = {}
): Promise<PaginatedProducts> {
  const limit = options.limit ?? DEFAULT_PAGE_SIZE;
  const page = options.page ?? 1;
  const trimmed = query.trim();

  if (!trimmed) {
    return { products: [], total: 0, page, limit, totalPages: 1 };
  }

  const db = getDb();
  const pattern = `%${trimmed}%`;

  const { data, count } = await db
    .from("products")
    .select(PRODUCT_LIST_SELECT, { count: "exact" })
    .or(`title.ilike.${pattern},description.ilike.${pattern},sku.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return {
    products: (data ?? []).map(mapListRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit) || 1,
  };
}
