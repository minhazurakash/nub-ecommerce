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

export function getSslCommerzConfig(): SslCommerzConfig {
  const isLive = process.env.SSLCOMMERZ_USE_LIVE === "true";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
    appUrl,
  };
}

export function isSslCommerzSandbox(): boolean {
  return process.env.SSLCOMMERZ_USE_LIVE !== "true";
}
