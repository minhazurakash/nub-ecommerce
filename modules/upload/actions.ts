"use server";

import { requireAdmin } from "@/modules/auth/actions";
import { uploadProductImage, type UploadProductImageResult } from "@/lib/supabase/upload-product-image";

export type UploadImageResult = UploadProductImageResult;

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  return uploadProductImage(file);
}
