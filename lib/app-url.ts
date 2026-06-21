import { headers } from "next/headers";
import { getAppUrlFromEnv, originFromHost } from "@/lib/app-url-env";

/**
 * Resolves the public site origin for callbacks (SSLCommerz, emails, etc.).
 * Prefers the incoming request host so live deployments work even when
 * NEXT_PUBLIC_APP_URL is still set to localhost.
 */
export async function resolveAppUrl(): Promise<string> {
  try {
    const headerList = await headers();
    const host =
      headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (host) {
      const fromRequest = originFromHost(
        host,
        headerList.get("x-forwarded-proto")
      );
      if (fromRequest && !fromRequest.includes("localhost")) {
        return fromRequest;
      }
    }
  } catch {
    // Outside a request context (scripts, tests).
  }

  const envUrl = getAppUrlFromEnv();
  if (!envUrl.includes("localhost")) {
    return envUrl;
  }

  return envUrl;
}
