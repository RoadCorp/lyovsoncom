import type { FieldHook } from "payload";

// Trims edge hyphens (a title ending in a space gave "/posts/laurel-…-worlds-")
// but keeps inner "--": collapsing would rename live URLs like
// /posts/stress--success the next time the locked slug re-syncs.
export const formatSlug = (val: string): string =>
  val
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

function getFallbackData({
  data,
  fallback,
  originalDoc,
}: {
  data?: Record<string, unknown>;
  fallback: string;
  originalDoc: unknown;
}): string | undefined {
  const fromData =
    data &&
    fallback in data &&
    typeof data[fallback] === "string" &&
    data[fallback].length > 0
      ? data[fallback]
      : undefined;

  if (fromData) {
    return fromData;
  }

  if (
    originalDoc &&
    typeof originalDoc === "object" &&
    fallback in originalDoc
  ) {
    const originalDocRecord = originalDoc as Record<string, unknown>;
    const fallbackValue = originalDocRecord[fallback];

    if (typeof fallbackValue === "string" && fallbackValue.length > 0) {
      return fallbackValue;
    }
  }
}

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === "string" && value.length > 0) {
      return formatSlug(value);
    }

    if (operation === "create" || !data?.slug) {
      const fallbackData = getFallbackData({
        data: data as Record<string, unknown> | undefined,
        fallback,
        originalDoc,
      });

      if (
        fallbackData &&
        typeof fallbackData === "string" &&
        fallbackData.length > 0
      ) {
        return formatSlug(fallbackData);
      }
    }

    // Return existing value or undefined (don't return null string)
    return value || undefined;
  };
