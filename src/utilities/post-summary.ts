import type { PaginatedDocs, Where } from "payload";
import type { Post, PostsSelect } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

// Keep authors available for the afterRead hook that builds populatedAuthors.
export const postSummarySelect = {
  title: true,
  slug: true,
  featuredImage: true,
  type: true,
  topics: true,
  project: true,
  publishedAt: true,
  createdAt: true,
  authors: true,
  populatedAuthors: true,
} as const satisfies PostsSelect;

export type PostSummary = Pick<Post, "id" | keyof typeof postSummarySelect>;

/** Newest-first post summaries for an archive. Callers own caching and tags. */
export async function findPostSummaries(
  where: Where,
  { limit, page }: { limit: number; page?: number }
): Promise<PaginatedDocs<PostSummary>> {
  const payload = await getPayloadClient();

  return payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    limit,
    page,
    where,
    sort: "-publishedAt",
    overrideAccess: true,
  });
}

export async function countPosts(where: Where): Promise<number> {
  const payload = await getPayloadClient();

  const count = await payload.count({
    collection: "posts",
    overrideAccess: true,
    where,
  });

  return count.totalDocs;
}
