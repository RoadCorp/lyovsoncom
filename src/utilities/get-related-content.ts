import { cacheLife, cacheTag } from "next/cache";
import {
  publicNotesWhere,
  publishedPostsWhere,
} from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { postSummarySelect } from "@/utilities/post-summary";
import { publicContentSelect } from "@/utilities/public-content-select";

export async function getRelatedPosts(ids: number[]) {
  "use cache";
  cacheTag("posts");
  cacheLife("posts");
  if (ids.length === 0) {
    return [];
  }
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 1,
    pagination: false,
    limit: ids.length,
    overrideAccess: true,
    where: { ...publishedPostsWhere(), id: { in: ids } },
  });
  return result.docs;
}

export async function getRelatedNotes(ids: number[]) {
  "use cache";
  cacheTag("notes");
  cacheLife("notes");
  if (ids.length === 0) {
    return [];
  }
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "notes",
    select: publicContentSelect,
    depth: 1,
    pagination: false,
    limit: ids.length,
    overrideAccess: false,
    where: { ...publicNotesWhere(), id: { in: ids } },
  });
  return result.docs;
}
