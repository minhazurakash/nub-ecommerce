"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/supabase/db";
import { formatDbError } from "@/lib/supabase/errors";
import { BANNERS_CACHE_TAG } from "@/lib/banner-utils";
import { bannerFormSchema } from "@/lib/validations/banner";
import { requireAdmin } from "@/modules/auth/actions";

export type BannerFormState = {
  error?: string;
};

export async function saveBanner(
  _prevState: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  await requireAdmin();

  const id = formData.get("id") as string | null;
  const raw = {
    title: formData.get("title") as string,
    headlineBefore: (formData.get("headlineBefore") as string) ?? "",
    headlineHighlight: (formData.get("headlineHighlight") as string) ?? "",
    headlineAfter: (formData.get("headlineAfter") as string) ?? "",
    ctaText: (formData.get("ctaText") as string) ?? "Shop Now",
    href: (formData.get("href") as string) ?? "/shop",
    imageUrl: formData.get("imageUrl") as string,
    sortOrder: formData.get("sortOrder") ?? "0",
    isActive: formData.get("isActive") === "on",
    startsAt: (formData.get("startsAt") as string) || null,
    endsAt: (formData.get("endsAt") as string) || null,
  };

  const parsed = bannerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? "Invalid banner data",
    };
  }

  const data = parsed.data;
  const db = getDb();
  const payload = {
    title: data.title,
    headline_before: data.headlineBefore,
    headline_highlight: data.headlineHighlight,
    headline_after: data.headlineAfter,
    cta_text: data.ctaText,
    href: data.href,
    image_url: data.imageUrl,
    sort_order: data.sortOrder,
    is_active: data.isActive,
    starts_at: data.startsAt ? new Date(data.startsAt).toISOString() : null,
    ends_at: data.endsAt ? new Date(data.endsAt).toISOString() : null,
  };

  try {
    if (id) {
      const { error } = await db.from("banners").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await db.from("banners").insert(payload);
      if (error) throw error;
    }
  } catch (error) {
    return {
      error: formatDbError(error, "Failed to save banner."),
    };
  }

  revalidateTag(BANNERS_CACHE_TAG);
  revalidatePath("/console/banners");
  revalidatePath("/");
  redirect("/console/banners");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;

  const db = getDb();
  try {
    const { error } = await db.from("banners").delete().eq("id", id);
    if (error) throw error;
  } catch {
    redirect("/console/banners?error=delete-failed");
  }

  revalidateTag(BANNERS_CACHE_TAG);
  revalidatePath("/console/banners");
  revalidatePath("/");
  redirect("/console/banners");
}
