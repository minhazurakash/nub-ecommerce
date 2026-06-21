import { getAppUrlFromEnv } from "@/lib/app-url-env";

/** Survives redirect if the gateway omits value_a; cleared after payment result. */
export const PENDING_ORDER_SESSION_KEY = "blueberry_pending_order";

export type SslCommerzConfig = {
  storeId: string;
  storePassword: string;
  sessionUrl: string;
  validationUrl: string;
  appUrl: string;
};

/** SSLCommerz public sandbox credentials (same as care-connect-hub). */
export const SSLCOMMERZ_SANDBOX_DEFAULTS = {
  storeId: "testbox",
  storePassword: "qwerty",
} as const;

export function getSslCommerzConfig(appUrl?: string): SslCommerzConfig {
  const isLive = process.env.SSLCOMMERZ_USE_LIVE === "true";
  const resolvedAppUrl = appUrl ?? getAppUrlFromEnv();

  const storeId =
    process.env.SSLCOMMERZ_STORE_ID ?? SSLCOMMERZ_SANDBOX_DEFAULTS.storeId;
  const storePassword =
    process.env.SSLCOMMERZ_STORE_PASSWORD ??
    SSLCOMMERZ_SANDBOX_DEFAULTS.storePassword;

  return {
    storeId,
    storePassword,
    sessionUrl: isLive
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    validationUrl: isLive
      ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
      : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
    appUrl: resolvedAppUrl,
  };
}

export function isSslCommerzSandbox(): boolean {
  return process.env.SSLCOMMERZ_USE_LIVE !== "true";
}
