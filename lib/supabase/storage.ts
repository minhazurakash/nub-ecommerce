import { createAdminClient } from "./admin";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export async function ensureProductImagesBucket(): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const bucketConfig = {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  };

  const exists = buckets?.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET);

  if (exists) {
    const { error: updateError } = await supabase.storage.updateBucket(
      PRODUCT_IMAGES_BUCKET,
      bucketConfig
    );
    if (updateError) {
      throw updateError;
    }
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    PRODUCT_IMAGES_BUCKET,
    bucketConfig
  );

  if (createError) {
    throw createError;
  }
}
