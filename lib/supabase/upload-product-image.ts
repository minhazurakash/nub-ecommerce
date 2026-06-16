import { randomUUID } from "crypto";
import { createAdminClient } from "./admin";
import {
  ensureProductImagesBucket,
  PRODUCT_IMAGES_BUCKET,
} from "./storage";

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export type UploadProductImageResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string };

export function resolveImageMimeType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.includes(file.type)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && MIME_BY_EXTENSION[extension]) {
    return MIME_BY_EXTENSION[extension];
  }

  return null;
}

export async function uploadProductImage(
  file: File
): Promise<UploadProductImageResult> {
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided." };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return { success: false, error: "File exceeds the 5 MB size limit." };
  }

  const mimeType = resolveImageMimeType(file);
  if (!mimeType) {
    return {
      success: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed.",
    };
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

  let { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error?.message?.toLowerCase().includes("bucket not found")) {
    try {
      await ensureProductImagesBucket();
      ({ data, error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, buffer, {
          contentType: mimeType,
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
