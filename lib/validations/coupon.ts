import { z } from "zod";
import { DiscountType } from "@/lib/types/database";

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Code can only contain letters, numbers, - and _"),
    discountType: z.nativeEnum(DiscountType),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    validFrom: z.string().min(1, "Start date is required"),
    validUntil: z.string().min(1, "End date is required"),
    isActive: z.boolean().default(true),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    minOrderAmount: z.coerce.number().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === DiscountType.PERCENTAGE && data.amount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100%",
        path: ["amount"],
      });
    }

    const from = new Date(data.validFrom);
    const until = new Date(data.validUntil);
    if (until <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["validUntil"],
      });
    }
  });

export type CouponFormInput = z.infer<typeof couponFormSchema>;
