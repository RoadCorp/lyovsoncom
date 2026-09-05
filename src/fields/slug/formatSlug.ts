import type { FieldHook } from "payload";

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
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
