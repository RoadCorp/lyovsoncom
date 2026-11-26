const MAX_TITLE_LENGTH = 110;
const MAX_EYEBROW_LENGTH = 48;
const MAX_META_LENGTH = 96;

function clampText(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return "";
  }
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export interface DynamicOgImageInput {
  eyebrow?: string | null;
  meta?: string | null;
  title: string;
}

/**
 * Builds a relative URL for the dynamic Open Graph image endpoint (`/og`).
 * Used as a rich typographic fallback when a post, project, or reference
 * has no custom uploaded image.
 */
export function buildDynamicOgImageUrl({
  eyebrow,
  meta,
  title,
}: DynamicOgImageInput): string {
  const params = new URLSearchParams();
  const safeTitle = clampText(title, MAX_TITLE_LENGTH);
  const safeEyebrow = clampText(eyebrow, MAX_EYEBROW_LENGTH);
  const safeMeta = clampText(meta, MAX_META_LENGTH);

  if (safeTitle) {
    params.set("title", safeTitle);
  }
  if (safeEyebrow) {
    params.set("eyebrow", safeEyebrow);
  }
  if (safeMeta) {
    params.set("meta", safeMeta);
  }

  const query = params.toString();
  return query ? `/og?${query}` : "/og";
}

export function sanitizeOgParam(
  value: string | null,
  maxLength: number
): string {
  return clampText(value, maxLength);
}

export const OG_PARAM_LIMITS = {
  eyebrow: MAX_EYEBROW_LENGTH,
  meta: MAX_META_LENGTH,
  title: MAX_TITLE_LENGTH,
} as const;
