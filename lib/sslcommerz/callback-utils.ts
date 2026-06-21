export function readOrderIdFromCallback(
  params: URLSearchParams,
  fallbackOrderId?: string | null
): string | null {
  return (
    params.get("oid") ||
    params.get("value_a") ||
    params.get("Value_A") ||
    params.get("tran_id") ||
    fallbackOrderId ||
    null
  );
}

export function isPaymentStatusValid(status: string | null): boolean {
  const normalized = (status ?? "").toUpperCase();
  return !normalized || normalized === "VALID" || normalized === "VALIDATED";
}
