"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Loader2, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from "@/modules/cart/cartSlice";
import { createOrder } from "@/modules/orders/actions";
import { shippingAddressSchema } from "@/lib/validations/checkout";
import { cn, formatPrice } from "@/lib/utils";
import type { Address } from "@/lib/types/database";

const SHIPPING_FLAT_RATE = 9.99;
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 75;

const contactSchema = z.object({
  email: z.string().email("Valid email is required"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
});

const paymentSchema = z.object({
  cardName: z.string().min(1, "Name on card is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(19)
    .regex(/^[\d\s]+$/, "Invalid card number"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().min(3, "CVV is required").max(4),
});

const checkoutSchema = z
  .object({
    contact: contactSchema,
    addressId: z.string().optional(),
    address: shippingAddressSchema.optional(),
    saveAddress: z.boolean().default(false),
    payment: paymentSchema,
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
  });

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const STEPS = [
  { id: 1, label: "Contact", icon: User },
  { id: 2, label: "Shipping", icon: MapPin },
  { id: 3, label: "Payment", icon: CreditCard },
] as const;

interface CheckoutFormProps {
  savedAddresses?: Address[];
  userEmail?: string;
  userName?: string | null;
}

const emptyAddress = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  isDefault: false,
};

export function CheckoutForm({
  savedAddresses = [],
  userEmail = "",
  userName = "",
}: CheckoutFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);

  const defaultAddressId =
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id;

  const [step, setStep] = useState(1);
  const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0);
  const [processing, setProcessing] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contact: {
        email: userEmail,
        fullName: userName ?? "",
        phone: "",
      },
      addressId: defaultAddressId,
      address: savedAddresses.length > 0 ? undefined : emptyAddress,
      saveAddress: false,
      payment: { cardName: "", cardNumber: "", expiry: "", cvv: "" },
      notes: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const saveAddress = watch("saveAddress");
  const addressId = watch("addressId");

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button className="mt-4" onClick={() => router.push("/shop")}>
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  const validateStep = async () => {
    if (step === 1) {
      return trigger("contact");
    }
    if (step === 2) {
      if (!useNewAddress) {
        if (!addressId) {
          toast.error("Please select a shipping address");
          return false;
        }
        return true;
      }
      return trigger("address");
    }
    if (step === 3) {
      return trigger("payment");
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(3, s + 1));
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await createOrder({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
        })),
        addressId: useNewAddress ? undefined : values.addressId,
        address: useNewAddress
          ? {
              ...values.address!,
              fullName: values.contact.fullName,
              phone: values.contact.phone,
            }
          : undefined,
        saveAddress: values.saveAddress,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(result.data.orderNumber)}`
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        {STEPS.map((s, index) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isComplete = step > s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive && "bg-primary/10 text-primary",
                  isComplete && "text-primary cursor-pointer",
                  !isActive && !isComplete && "text-muted-foreground"
                )}
                disabled={s.id > step}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isComplete && "border-primary bg-primary/10",
                    !isActive && !isComplete && "border-muted"
                  )}
                >
                  {isComplete ? "✓" : <Icon className="h-4 w-4" />}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    step > s.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  We&apos;ll use this to send order updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("contact.email")}
                    placeholder="you@example.com"
                  />
                  {errors.contact?.email && (
                    <p className="text-sm text-destructive">
                      {errors.contact.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    {...register("contact.fullName")}
                    placeholder="Jane Doe"
                  />
                  {errors.contact?.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.contact.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("contact.phone")}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.contact?.phone && (
                    <p className="text-sm text-destructive">
                      {errors.contact.phone.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <Label>Saved addresses</Label>
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                          !useNewAddress && addressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="radio"
                          name="addressId"
                          checked={!useNewAddress && addressId === addr.id}
                          onChange={() => {
                            setUseNewAddress(false);
                            setValue("addressId", addr.id);
                            setValue("address", undefined);
                          }}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium">{addr.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.fullName}, {addr.line1}, {addr.city},{" "}
                            {addr.state} {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseNewAddress(true);
                        setValue("addressId", undefined);
                        setValue("address", emptyAddress);
                      }}
                    >
                      Use a new address
                    </Button>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="label">Label</Label>
                        <Input
                          id="label"
                          {...register("address.label")}
                          placeholder="Home"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="line1">Address line 1</Label>
                        <Input
                          id="line1"
                          {...register("address.line1")}
                          placeholder="123 Main St"
                        />
                        {errors.address?.line1 && (
                          <p className="text-sm text-destructive">
                            {errors.address.line1.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2">Address line 2 (optional)</Label>
                      <Input id="line2" {...register("address.line2")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...register("address.city")} />
                        {errors.address?.city && (
                          <p className="text-sm text-destructive">
                            {errors.address.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...register("address.state")} />
                        {errors.address?.state && (
                          <p className="text-sm text-destructive">
                            {errors.address.state.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal code</Label>
                        <Input
                          id="postalCode"
                          {...register("address.postalCode")}
                        />
                        {errors.address?.postalCode && (
                          <p className="text-sm text-destructive">
                            {errors.address.postalCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={(checked) =>
                          setValue("saveAddress", checked === true)
                        }
                      />
                      <Label htmlFor="saveAddress" className="font-normal">
                        Save this address for future orders
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>
                  Demo payment — no real charges will be made
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  Use any 16-digit card number, future expiry (MM/YY), and any
                  3-digit CVV to complete this demo checkout.
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on card</Label>
                  <Input
                    id="cardName"
                    {...register("payment.cardName")}
                    placeholder="Jane Doe"
                  />
                  {errors.payment?.cardName && (
                    <p className="text-sm text-destructive">
                      {errors.payment.cardName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card number</Label>
                  <Input
                    id="cardNumber"
                    {...register("payment.cardNumber")}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                  {errors.payment?.cardNumber && (
                    <p className="text-sm text-destructive">
                      {errors.payment.cardNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                    <Input
                      id="expiry"
                      {...register("payment.expiry")}
                      placeholder="12/28"
                      maxLength={5}
                    />
                    {errors.payment?.expiry && (
                      <p className="text-sm text-destructive">
                        {errors.payment.expiry.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      {...register("payment.cvv")}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.payment?.cvv && (
                      <p className="text-sm text-destructive">
                        {errors.payment.cvv.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order notes (optional)</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Special delivery instructions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || processing}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={processing}>
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order · {formatPrice(total)}
              </Button>
            )}
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId ?? "default"}`}
                  className="flex justify-between text-sm"
                >
                  <span className="line-clamp-1 text-muted-foreground">
                    {item.title} × {item.quantity}
                  </span>
                  <span>
                    {formatPrice(
                      (item.discountPrice ?? item.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
