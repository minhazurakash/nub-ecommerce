"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@/lib/types/database";
import { getDb } from "@/lib/supabase/db";
import { requireRoleAdmin } from "@/modules/auth/actions";

export async function updateUserRole(formData: FormData) {
  const currentUser = await requireRoleAdmin();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  if (!userId || !role) return;

  const validRoles = Object.values(Role);
  if (!validRoles.includes(role)) return;
  if (userId === currentUser.id && role !== Role.ADMIN) return;

  const db = getDb();
  await db.from("users").update({ role }).eq("id", userId);

  revalidatePath("/console/users");
}
