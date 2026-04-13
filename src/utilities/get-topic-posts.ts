import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Post } from "@/payload-types";
import { topicPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

const DEFAULT_TOPIC_PAGE_SIZE = 25;

export function getTopicPosts(
  slug: string
): Promise<PaginatedDocs<Post> | null> {
  return getPaginatedTopicPosts(slug, 1, DEFAULT_TOPIC_PAGE_SIZE);
}

export async function getPaginatedTopicPosts(
  slug: string,
  pageNumber: number,
  limit = DEFAULT_TOPIC_PAGE_SIZE
): Promise<PaginatedDocs<Post> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("topics");
  cacheTag(`topic-${slug}`);
  cacheTag(`topic-${slug}-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const topic = await payload.find({
    collection: "topics",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const topicId = topic.docs[0]?.id;

  if (!topicId) {
    return null;
  }

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    page: pageNumber,
    where: topicPostsWhere(topicId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

export async function getTopicPostCount(slug: string): Promise<number | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("topics");
  cacheTag(`topic-${slug}`);
  cacheTag(`topic-${slug}-count`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const topic = await payload.find({
    collection: "topics",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const topicId = topic.docs[0]?.id;
  if (!topicId) {
    return null;
  }

  const count = await payload.count({
    collection: "posts",
    overrideAccess: true,
    where: topicPostsWhere(topicId),
  });

  return count.totalDocs;
}
