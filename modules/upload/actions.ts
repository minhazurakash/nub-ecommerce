"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureProductImagesBucket,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/storage";
import { requireAdmin } from "@/modules/auth/actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadImageResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File exceeds the 5 MB size limit." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `uploads/${Date.now()}-${randomUUID()}.${extension}`;

  try {
    await ensureProductImagesBucket();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage setup failed.";
    return {
      success: false,
      error: `Could not prepare image storage: ${message}`,
    };
  }

  const supabase = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  let { data, error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error?.message?.toLowerCase().includes("bucket not found")) {
    try {
      await ensureProductImagesBucket();
      ({ data, error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      }));
    } catch (retryError) {
      const message =
        retryError instanceof Error ? retryError.message : "Storage setup failed.";
      return { success: false, error: `Could not create storage bucket: ${message}` };
    }
  }

  if (error || !data) {
    return { success: false, error: error?.message ?? "Upload failed." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(data.path);

  return { success: true, url: publicUrl, path: data.path };
}
