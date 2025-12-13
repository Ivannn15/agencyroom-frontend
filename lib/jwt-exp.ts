const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

export function getJwtTtlSeconds(token: string, fallbackSeconds = TEN_YEARS_SECONDS): number {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return fallbackSeconds;
  }

  try {
    const payloadJson = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const ttlSeconds = payload.exp - nowSeconds;
      return ttlSeconds > 0 ? ttlSeconds : fallbackSeconds;
    }
  } catch {
    // ignore parse errors and fallback
  }

  return fallbackSeconds;
}
