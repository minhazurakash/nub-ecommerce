type SupabaseError = {
  code?: string;
  message?: string;
  details?: string;
};

export function formatDbError(error: unknown, fallback = "An unexpected error occurred."): string {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : fallback;
  }

  const err = error as SupabaseError;
  const message = err.message ?? "";

  if (err.code === "23505") {
    if (message.includes("sku")) {
      return "SKU already exists. Use a unique SKU.";
    }
    if (message.includes("slug")) {
      return "Slug already exists. Choose a different title or slug.";
    }
    return "A record with this value already exists.";
  }

  if (err.code === "23503") {
    if (message.includes("categories")) {
      return "Cannot delete this category while products or subcategories still reference it.";
    }
    return "Cannot complete action: related records exist or a reference is invalid.";
  }

  if (message) return message;
  return fallback;
}
