import { cacheLife, cacheTag } from "next/cache";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { postSummarySelect } from "@/utilities/post-summary";

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
