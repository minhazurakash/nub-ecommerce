import { getDb } from "@/lib/supabase/db";
import {
  mapProduct,
  mapProductImage,
  mapProductVariant,
} from "@/lib/supabase/mappers";
import type { ProductVariant } from "@/lib/types/database";

type OrderItemRow = {
  product_id: string;
  quantity: number;
  variant_snapshot: Record<string, unknown> | null;
};

export async function decrementStockForOrderItems(items: OrderItemRow[]) {
  const db = getDb();
  const productIds = [...new Set(items.map((i) => i.product_id))];

  const { data: productRows } = await db
    .from("products")
    .select("*, product_variants(*)")
    .in("id", productIds);

  const productMap = new Map(
    (productRows ?? []).map((row) => {
      const p = mapProduct(row);
      const variants = (row.product_variants ?? []).map(mapProductVariant);
      return [p.id, { ...p, variants }] as const;
    })
  );

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) continue;

    const variantId = item.variant_snapshot?.id as string | undefined;
    if (variantId) {
      const variant = product.variants.find(
        (v: ProductVariant) => v.id === variantId
      );
      if (!variant) continue;
      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }
      await db
        .from("product_variants")
        .update({ stock: variant.stock - item.quantity })
        .eq("id", variant.id);
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }
      await db
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", product.id);
    }
  }
}

export async function decrementStockForOrder(orderId: string) {
  const db = getDb();
  const { data: items, error } = await db
    .from("order_items")
    .select("product_id, quantity, variant_snapshot")
    .eq("order_id", orderId);

  if (error) throw error;
  if (!items?.length) return;

  await decrementStockForOrderItems(items);
}
