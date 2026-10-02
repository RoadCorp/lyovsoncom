import { PRIMARY_LYOVSONS } from "@/utilities/routes";

/**
 * Every dotless first path segment that is a real route, other than profile
 * usernames. top-level-routes.test.ts fails if a new top-level route folder
 * is added without listing it here.
 */
export const TOP_LEVEL_ROUTE_SEGMENTS = new Set([
  "about",
  "activities",
  "admin",
  "ai-docs",
  "am",
  "api",
  "contact",
  "notes",
  "offline",
  "page",
  "playground",
  "posts",
  "privacy-policy",
  "projects",
  "search",
  "topics",
]);

const PROFILE_USERNAMES = new Set<string>(PRIMARY_LYOVSONS);

/**
 * True when the path would fall through to `[lyovson]` for a username that
 * has no profile. With Cache Components the profile layout streams its
 * shell before the lookup finishes, so its `notFound()` can't set a 404
 * status; the proxy answers these paths instead. Add a username to
 * PRIMARY_LYOVSONS when a new profile is published.
 */
export function isUnknownProfilePath(pathname: string): boolean {
  const segment = pathname.split("/")[1] ?? "";
  if (!segment || segment.includes(".") || segment.startsWith("_")) {
    return false;
  }
  return !(
    TOP_LEVEL_ROUTE_SEGMENTS.has(segment) || PROFILE_USERNAMES.has(segment)
  );
}
