import { createAdminClient } from "./admin";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export async function ensureProductImagesBucket(): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  if (buckets?.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    PRODUCT_IMAGES_BUCKET,
    {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }
  );

  if (createError) {
    throw createError;
  }
}
