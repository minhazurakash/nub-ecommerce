import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";
import { uploadProductImage } from "@/lib/supabase/upload-product-image";
import { Role } from "@/lib/types/database";

export const runtime = "nodejs";

async function assertStaffUploadAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "You must be signed in to upload images." },
        { status: 401 }
      ),
    };
  }

  const db = getDb();
  const { data: profile } = await db
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (
    !profile ||
    (profile.role !== Role.ADMIN && profile.role !== Role.EDITOR)
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: "You do not have permission to upload images." },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  const access = await assertStaffUploadAccess();
  if (!access.ok) {
    return access.response;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid upload request." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file provided." },
      { status: 400 }
    );
  }

  const result = await uploadProductImage(file);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
