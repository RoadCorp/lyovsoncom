import type { Post, PostsSelect } from "@/payload-types";

// Keep authors available for the afterRead hook that builds populatedAuthors.
export const postSummarySelect = {
  title: true,
  slug: true,
  featuredImage: true,
  type: true,
  topics: true,
  project: true,
  publishedAt: true,
  authors: true,
  populatedAuthors: true,
} as const satisfies PostsSelect;

export type PostSummary = Pick<Post, "id" | keyof typeof postSummarySelect>;
