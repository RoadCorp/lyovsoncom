import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import { TOPIC_POSTS_PER_PAGE } from "@/utilities/archive";
import { topicPostsWhere } from "@/utilities/content-queries";
import { getTopic } from "@/utilities/get-topic";
import {
  countPosts,
  findPostSummaries,
  type PostSummary,
} from "@/utilities/post-summary";

export function getTopicPosts(
  slug: string
): Promise<PaginatedDocs<PostSummary> | null> {
  return getPaginatedTopicPosts(slug, 1, TOPIC_POSTS_PER_PAGE);
}

export async function getPaginatedTopicPosts(
  slug: string,
  pageNumber: number,
  limit = TOPIC_POSTS_PER_PAGE
): Promise<PaginatedDocs<PostSummary> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("topics");
  cacheTag(`topic-${slug}`);
  cacheTag(`topic-${slug}-page-${pageNumber}`);
  cacheLife("posts");

  const topicId = (await getTopic(slug))?.id;
  if (!topicId) {
    return null;
  }

  return findPostSummaries(topicPostsWhere(topicId), {
    limit,
    page: pageNumber,
  });
}

export async function getTopicPostCount(slug: string): Promise<number | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("topics");
  cacheTag(`topic-${slug}`);
  cacheTag(`topic-${slug}-count`);
  cacheLife("posts");

  const topicId = (await getTopic(slug))?.id;
  if (!topicId) {
    return null;
  }

  return countPosts(topicPostsWhere(topicId));
}
