import { createAdminClient } from "./admin";

/** Server-side Supabase client for database operations (bypasses RLS). */
export function getDb() {
  return createAdminClient();
}
