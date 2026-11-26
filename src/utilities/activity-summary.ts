import type { ActivitiesSelect } from "@/payload-types";

/**
 * Projection for public activity cards, preview rails, and redirect lookups.
 * Excludes rich-text `notes`, `reviews`, and search embeddings so list queries
 * and Next.js cache entries stay lean.
 */
export const activitySummarySelect = {
  slug: true,
  activityType: true,
  reference: true,
  participants: true,
  startedAt: true,
  finishedAt: true,
  publishedAt: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies ActivitiesSelect;
