import dns from "dns";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

dns.setDefaultResultOrder("ipv4first");

const POOLER_REGIONS = [
  "ap-northeast-1",
  "ap-south-1",
  "ap-south-2",
  "ap-southeast-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "eu-central-2",
  "sa-east-1",
];

const POOLER_PREFIXES = ["aws-1", "aws-0"];

function getProjectRef(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return new URL(supabaseUrl).hostname.split(".")[0];
}

function buildPoolerUrl(
  ref: string,
  password: string,
  host: string,
  port = 5432
): string {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${ref}:${encoded}@${host}:${port}/postgres`;
}

export function getConnectionCandidates(): string[] {
  const candidates: string[] = [];

  if (process.env.DATABASE_URL) {
    candidates.push(process.env.DATABASE_URL);
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = getProjectRef();
  if (!password || !ref) return candidates;

  const host = process.env.SUPABASE_DB_HOST;
  if (host) {
    candidates.push(buildPoolerUrl(ref, password, host));
  }

  const region = process.env.SUPABASE_DB_REGION;
  if (region) {
    const prefix = process.env.SUPABASE_DB_POOLER_PREFIX ?? "aws-1";
    candidates.push(
      buildPoolerUrl(ref, password, `${prefix}-${region}.pooler.supabase.com`)
    );
  }

  const encoded = encodeURIComponent(password);
  candidates.push(
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`
  );

  return [...new Set(candidates)];
}

async function canConnect(connectionString: string): Promise<boolean> {
  const sql = postgres(connectionString, {
    max: 1,
    ssl: "require",
    connect_timeout: 8,
  });

  try {
    await sql`SELECT 1 AS ok`;
    return true;
  } catch {
    return false;
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}

async function discoverPoolerHost(
  ref: string,
  password: string
): Promise<string | null> {
  const combos = POOLER_PREFIXES.flatMap((prefix) =>
    POOLER_REGIONS.map((region) => `${prefix}-${region}.pooler.supabase.com`)
  );

  const batchSize = 6;
  for (let i = 0; i < combos.length; i += batchSize) {
    const batch = combos.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (host) => {
        const url = buildPoolerUrl(ref, password, host);
        const ok = await canConnect(url);
        return ok ? host : null;
      })
    );

    const match = results.find(Boolean);
    if (match) return match;
  }

  return null;
}

export async function resolveDatabaseUrl(): Promise<string | null> {
  for (const url of getConnectionCandidates()) {
    if (await canConnect(url)) return url;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = getProjectRef();
  if (!password || !ref) return null;

  console.log(
    "Direct connection unavailable — locating IPv4 session pooler host..."
  );

  const host = await discoverPoolerHost(ref, password);
  if (!host) return null;

  console.log(
    `Found pooler: ${host}\n` +
      `Tip: add SUPABASE_DB_HOST="${host}" to .env.local to skip discovery next time.`
  );

  return buildPoolerUrl(ref, password, host);
}

/** @deprecated Use resolveDatabaseUrl() */
export function getDatabaseUrl(): string | null {
  return getConnectionCandidates()[0] ?? null;
}

export async function setupDatabase(): Promise<void> {
  const connectionString = await resolveDatabaseUrl();

  if (!connectionString) {
    console.error(
      "Cannot auto-create tables without a database connection.\n\n" +
        "Your network likely cannot reach Supabase's IPv6-only direct host.\n" +
        "Use the IPv4 Session pooler string from your dashboard instead.\n\n" +
        "Add ONE of these to .env.local:\n\n" +
        "  Option A — session pooler URI (recommended):\n" +
        "    DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres\n" +
        "    (Supabase Dashboard → Settings → Database → Connection string → Session pooler)\n\n" +
        "  Option B — pooler host + password:\n" +
        "    SUPABASE_DB_PASSWORD=your-db-password\n" +
        "    SUPABASE_DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com\n\n" +
        "  Option C — password only (auto-discovers pooler host, slower):\n" +
        "    SUPABASE_DB_PASSWORD=your-db-password\n"
    );
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1, ssl: "require" });
  const schemaPath = resolve(process.cwd(), "supabase/schema.sql");
  const schema = readFileSync(schemaPath, "utf8");

  console.log("Creating database tables...");

  try {
    await sql.unsafe(schema);
    console.log("Database schema ready.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to create schema:", message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}
