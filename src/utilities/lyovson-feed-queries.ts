import type { PaginatedDocs } from "payload";
import type { Activity, Note } from "@/payload-types";
import {
  getNoteAuthorByUsername,
  lyovsonActivitiesWhere,
  lyovsonNotesWhere,
  lyovsonPostsWhere,
} from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { type PostSummary, postSummarySelect } from "@/utilities/post-summary";
import { publicContentSelect } from "@/utilities/public-content-select";

/*
 * Profile content queries. Without a page they read the newest `limit`
 * documents, which the mixed feed merges across collections.
 */

function emptyPaginatedDocs<T>(page: number, limit: number): PaginatedDocs<T> {
  return {
    docs: [],
    hasNextPage: false,
    hasPrevPage: page > 1,
    limit,
    nextPage: null,
    page,
    pagingCounter: (page - 1) * limit + 1,
    prevPage: page > 1 ? page - 1 : null,
    totalDocs: 0,
    totalPages: 1,
  };
}

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

export async function findLyovsonNotes(
  username: string,
  limit: number,
  page?: number
): Promise<PaginatedDocs<Note>> {
  if (!getNoteAuthorByUsername(username)) {
    return emptyPaginatedDocs<Note>(page ?? 1, limit);
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "notes",
    select: publicContentSelect,
    depth: 2,
    limit,
    page,
    where: lyovsonNotesWhere(username) ?? undefined,
    sort: "-publishedAt",
    overrideAccess: false,
  });

  return { ...result, docs: result.docs as Note[] };
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

export async function countLyovsonContent(lyovsonId: number, username: string) {
  const payload = await getPayloadClient();
  const [posts, notes, activities] = await Promise.all([
    payload.count({
      collection: "posts",
      overrideAccess: true,
      where: lyovsonPostsWhere(lyovsonId),
    }),
    payload.count({
      collection: "notes",
      overrideAccess: false,
      where: lyovsonNotesWhere(username) ?? undefined,
    }),
    payload.count({
      collection: "activities",
      overrideAccess: true,
      where: lyovsonActivitiesWhere(lyovsonId),
    }),
  ]);

  return {
    posts: posts.totalDocs,
    notes: notes.totalDocs,
    activities: activities.totalDocs,
  };
}
