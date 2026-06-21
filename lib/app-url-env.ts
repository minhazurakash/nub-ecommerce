function normalizeAppUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Env / platform fallbacks when request headers are unavailable. */
export function getAppUrlFromEnv(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return normalizeAppUrl(explicit);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeAppUrl(`https://${vercelUrl}`);
  }

  return "http://localhost:3000";
}

export function originFromHost(host: string, proto?: string | null): string {
  const hostname = host.split(",")[0]?.trim();
  if (!hostname) return "";

  const isLocal =
    hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1");
  const scheme =
    proto?.split(",")[0]?.trim() || (isLocal ? "http" : "https");

  return normalizeAppUrl(`${scheme}://${hostname}`);
}
