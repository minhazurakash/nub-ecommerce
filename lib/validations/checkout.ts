import { z } from "zod";
import { addressSchema } from "@/lib/validations/product";

/** Shipping fields only — fullName/phone come from the contact step */
export const shippingAddressSchema = addressSchema.omit({
  fullName: true,
  phone: true,
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  variantId: z.string().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

export const checkoutFormSchema = z
  .object({
    items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
    addressId: z.string().optional(),
    address: addressSchema.optional(),
    saveAddress: z.boolean().optional().default(false),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.addressId) return;

    if (!data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A shipping address is required",
        path: ["address"],
      });
      return;
    }

    const parsed = shippingAddressSchema.safeParse(data.address);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue(issue);
      }
    }

    if (!data.address.fullName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name is required",
        path: ["address", "fullName"],
      });
    }
    if (!data.address.phone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone is required",
        path: ["address", "phone"],
      });
    }
  });

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
