import type { PaginatedDocs } from "payload";
import type { Activity } from "@/payload-types";
import {
  lyovsonActivitiesWhere,
  lyovsonPostsWhere,
} from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { type PostSummary, postSummarySelect } from "@/utilities/post-summary";
import { publicContentSelect } from "@/utilities/public-content-select";

/*
 * Profile content queries. Without a page they read the newest `limit`
 * documents, which the mixed feed merges across collections.
 */

export async function findLyovsonPosts(
  lyovsonId: number,
  limit: number,
  page?: number
): Promise<PaginatedDocs<PostSummary>> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    limit,
    page,
    where: lyovsonPostsWhere(lyovsonId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return { ...result, docs: result.docs as PostSummary[] };
}

export async function findLyovsonActivities(
  lyovsonId: number,
  limit: number,
  page?: number
): Promise<PaginatedDocs<Activity>> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "activities",
    select: publicContentSelect,
    depth: 2,
    limit,
    page,
    where: lyovsonActivitiesWhere(lyovsonId),
    sort: "-finishedAt",
    overrideAccess: true,
  });

  return { ...result, docs: result.docs as Activity[] };
}

export async function countLyovsonContent(lyovsonId: number) {
  const payload = await getPayloadClient();
  const [posts, activities] = await Promise.all([
    payload.count({
      collection: "posts",
      overrideAccess: true,
      where: lyovsonPostsWhere(lyovsonId),
    }),
    payload.count({
      collection: "activities",
      overrideAccess: true,
      where: lyovsonActivitiesWhere(lyovsonId),
    }),
  ]);

  return {
    posts: posts.totalDocs,
    activities: activities.totalDocs,
  };
}
