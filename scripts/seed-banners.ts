/**
 * Seed default hero banners into the database.
 * Usage: npm run db:seed-banners
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { defaultBannerRowsForDb } from "../lib/banner-seed-data";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const rows = defaultBannerRowsForDb();

  const { data, error } = await db
    .from("banners")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true })
    .select("id, title");

  if (error) {
    console.error("Failed to seed banners:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${data?.length ?? rows.length} banner(s):`);
  for (const banner of data ?? rows) {
    console.log(`  - ${banner.title} (${banner.id})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
