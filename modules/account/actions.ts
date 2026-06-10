"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/supabase/db";
import { toAddressInsert } from "@/lib/supabase/mappers";
import {
  addressSchema,
  profileSchema,
  type AddressInput,
  type ProfileInput,
} from "@/lib/validations/product";
import { requireUser } from "@/modules/auth/actions";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid profile data",
    };
  }

  const db = getDb();
  const { data, error } = await db
    .from("users")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      avatar_url: parsed.data.avatarUrl,
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (error) return { success: false, error: "Failed to update profile" };

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { success: true, data: { id: data.id } };
}

export async function createAddress(
  input: AddressInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid address data",
    };
  }

  const db = getDb();
  if (parsed.data.isDefault) {
    await db
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { data, error } = await db
    .from("addresses")
    .insert(toAddressInsert(user.id, parsed.data))
    .select("id")
    .single();

  if (error) return { success: false, error: "Failed to create address" };

  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true, data: { id: data.id } };
}

export async function updateAddress(
  addressId: string,
  input: AddressInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid address data",
    };
  }

  const db = getDb();
  const { data: existing } = await db
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { success: false, error: "Address not found" };

  if (parsed.data.isDefault) {
    await db
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true)
      .neq("id", addressId);
  }

  const { data, error } = await db
    .from("addresses")
    .update({
      label: parsed.data.label,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 ?? null,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode,
      country: parsed.data.country,
      is_default: parsed.data.isDefault ?? false,
    })
    .eq("id", addressId)
    .select("id")
    .single();

  if (error) return { success: false, error: "Failed to update address" };

  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true, data: { id: data.id } };
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const user = await requireUser();
  const db = getDb();

  const { data: existing } = await db
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { success: false, error: "Address not found" };

  const { error } = await db.from("addresses").delete().eq("id", addressId);
  if (error) return { success: false, error: "Failed to delete address" };

  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true, data: undefined };
}

export async function setDefaultAddress(
  addressId: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const db = getDb();

  const { data: existing } = await db
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { success: false, error: "Address not found" };

  await db
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  const { data, error } = await db
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .select("id")
    .single();

  if (error) return { success: false, error: "Failed to set default address" };

  revalidatePath("/account");
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true, data: { id: data.id } };
}
