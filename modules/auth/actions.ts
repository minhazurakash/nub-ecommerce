"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/supabase/db";
import { mapUser, toUserInsert } from "@/lib/supabase/mappers";
import { isStaffRole } from "@/lib/auth";
import { Role, type User } from "@/lib/types/database";

function getPostLoginRedirect(user: User | null, redirectTo: string) {
  if (user && isStaffRole(user.role) && redirectTo === "/account") {
    return "/console";
  }
  return redirectTo;
}

async function upsertUser(authId: string, email: string, name?: string) {
  const db = getDb();
  const { data: existing } = await db
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .maybeSingle();

  if (existing) {
    const { data } = await db
      .from("users")
      .update({ email, name: name ?? existing.name })
      .eq("auth_id", authId)
      .select("*")
      .single();
    return data ? mapUser(data) : null;
  }

  const { data } = await db
    .from("users")
    .insert(toUserInsert({ authId, email, name, role: Role.USER }))
    .select("*")
    .single();

  return data ? mapUser(data) : null;
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return { error: error.message };

  if (data.user) {
    await upsertUser(data.user.id, email, name);
  }

  redirect("/account");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/account";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  let user: User | null = null;
  if (data.user) {
    user = await upsertUser(
      data.user.id,
      data.user.email!,
      data.user.user_metadata?.name
    );
  }

  redirect(getPostLoginRedirect(user, redirectTo));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const db = getDb();
  const { data } = await db
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  return data ? mapUser(data) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN && user.role !== Role.EDITOR) {
    redirect("/account");
  }
  return user;
}

export async function requireRoleAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) redirect("/console");
  return user;
}
