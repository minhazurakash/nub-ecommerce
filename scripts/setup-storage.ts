/**
 * Ensures the product-images storage bucket exists.
 * Usage: yarn db:setup-storage
 */
import { config } from "dotenv";
import { resolve } from "path";
import { ensureProductImagesBucket } from "../lib/supabase/storage";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Missing Supabase env vars. Ensure .env.local contains:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL\n" +
        "  SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  try {
    await ensureProductImagesBucket();
    console.log('Storage bucket "product-images" is ready.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to set up storage bucket:", message);
    process.exit(1);
  }
}

main();
