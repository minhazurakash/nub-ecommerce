import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Review is too long"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
