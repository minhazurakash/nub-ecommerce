import { config } from "dotenv";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import { resolveDatabaseUrl } from "./setup-db";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

async function migrate(): Promise<void> {
  const connectionString = await resolveDatabaseUrl();

  if (!connectionString) {
    console.error(
      "Cannot run migrations without a database connection.\n" +
        "Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  const migrationsDir = resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  const sql = postgres(connectionString, { max: 1, ssl: "require" });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    const applied = await sql<{ id: string }[]>`
      SELECT id FROM schema_migrations
    `;
    const appliedSet = new Set(applied.map((row) => row.id));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      const migrationPath = resolve(migrationsDir, file);
      const migration = readFileSync(migrationPath, "utf8");

      console.log(`Applying ${file}...`);
      await sql.unsafe(migration);
      await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
      console.log(`Applied ${file}`);
    }

    console.log("Migrations complete.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Migration failed:", message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
