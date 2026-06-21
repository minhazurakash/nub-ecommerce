import { z } from "zod";

export const bannerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  headlineBefore: z.string().default(""),
  headlineHighlight: z.string().default(""),
  headlineAfter: z.string().default(""),
  ctaText: z.string().min(1, "CTA text is required").default("Shop Now"),
  href: z.string().min(1, "Link is required").default("/shop"),
  imageUrl: z
    .string()
    .min(1, "Image is required")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
      "Image must be a valid path or URL"
    ),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export type BannerFormInput = z.infer<typeof bannerFormSchema>;
