import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Post } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import type { PostSummary } from "@/utilities/post-summary";
import { postSummarySelect } from "@/utilities/post-summary";
import type { PostFilterType } from "@/utilities/post-type";
import { POST_FILTER_TYPES } from "@/utilities/post-type";
import { publicContentSelect } from "@/utilities/public-content-select";

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag("posts");
  cacheTag(`post-${slug}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "posts",
    where: {
      ...publishedPostsWhere(),
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
    select: publicContentSelect,
    // The page's author metadata reads the populated Lyovsons, an auth
    // collection that anonymous access cannot read.
    overrideAccess: true,
  });

  return (response.docs[0] as Post) || null;
}

export async function getLatestPosts(
  limit = 12
): Promise<PaginatedDocs<PostSummary>> {
  "use cache";
  cacheTag("posts");
  cacheTag("homepage");
  cacheLife("posts");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    limit,
    sort: "-publishedAt",
    where: publishedPostsWhere(),
  });

  return result;
}

export async function getPaginatedPosts(
  pageNumber: number,
  limit = 12
): Promise<PaginatedDocs<PostSummary>> {
  "use cache";
  cacheTag("posts");
  cacheTag(`posts-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    limit,
    page: pageNumber,
    sort: "-publishedAt",
    where: publishedPostsWhere(),
  });

  return result;
}

export async function getPostCount() {
  "use cache";
  cacheTag("posts");
  cacheTag("post-count");
  cacheLife("posts");

  const payload = await getPayloadClient();
  return await payload.count({
    collection: "posts",
    where: publishedPostsWhere(),
  });
}

export type PostTypeCounts = Record<PostFilterType, number>;

export async function getPostTypeCounts(): Promise<PostTypeCounts> {
  "use cache";
  cacheTag("posts");
  cacheTag("post-count");
  cacheLife("posts");

  const payload = await getPayloadClient();
  const entries = await Promise.all(
    POST_FILTER_TYPES.map(async (postType) => {
      const result = await payload.count({
        collection: "posts",
        where: {
          ...publishedPostsWhere(),
          type: {
            equals: postType,
          },
        },
      });
      return [postType, result.totalDocs] as const;
    })
  );

  return Object.fromEntries(entries) as PostTypeCounts;
}

export async function getPostsByType(
  postType: PostFilterType,
  pageNumber = 1,
  limit = 12
): Promise<PaginatedDocs<PostSummary>> {
  "use cache";
  cacheTag("posts");
  cacheTag(`posts-type-${postType}`);
  cacheTag(`posts-type-${postType}-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  return await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    limit,
    page: pageNumber,
    sort: "-publishedAt",
    where: {
      ...publishedPostsWhere(),
      type: {
        equals: postType,
      },
    },
  });
}
