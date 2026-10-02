import { createHash, timingSafeEqual } from "node:crypto";

const BEARER_PREFIX = "Bearer ";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/**
 * True when the request carries `Authorization: Bearer <CRON_SECRET>`.
 * Compares fixed-length digests in constant time and fails closed when the
 * secret is not configured.
 */
export function isCronRequest(headers: Headers): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = headers.get("authorization");

  if (!(secret && authorization?.startsWith(BEARER_PREFIX))) {
    return false;
  }

  const token = authorization.slice(BEARER_PREFIX.length);

  return timingSafeEqual(digest(token), digest(secret));
}
