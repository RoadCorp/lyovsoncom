import type { SlugField } from "payload";

import { formatSlug } from "./format-slug";

/**
 * Payload's native slug field: generated from `useAsSlug` while empty, never
 * rewritten once set, and deduped on create. `formatSlug` keeps the site's
 * existing URL shape (inner "--" survives) for new slugs.
 */
export const slugField = (useAsSlug = "title"): SlugField => ({
  name: "slug",
  type: "slug",
  useAsSlug,
  index: true,
  slugify: ({ valueToSlugify }) =>
    typeof valueToSlugify === "string" ? formatSlug(valueToSlugify) : undefined,
  admin: {
    position: "sidebar",
  },
});
