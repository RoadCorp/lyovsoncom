import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Topic } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { getRelationId } from "@/utilities/relations";

export async function getTopic(slug: string): Promise<Topic | null> {
  "use cache";
  cacheTag("topics");
  cacheTag(`topic-${slug}`);
  cacheLife("topics");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "topics",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  return (response.docs[0] as Topic) || null;
}

export async function getAllTopics(): Promise<PaginatedDocs<Topic>> {
  "use cache";
  cacheTag("topics");
  cacheLife("topics");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "topics",
    limit: 1000,
    sort: "name:asc",
  });

  return {
    ...result,
    docs: result.docs as Topic[],
  };
}

export interface TopicIndexEntry {
  color: string | null;
  id: number;
  name: string;
  postCount: number;
  slug: string;
}

/** Topics that have published posts, with their counts, for /topics. */
export async function getTopicIndex(): Promise<TopicIndexEntry[]> {
  "use cache";
  cacheTag("topics");
  cacheTag("posts");
  cacheLife("topics");

  const payload = await getPayloadClient();
  const [topics, posts] = await Promise.all([
    payload.find({
      collection: "topics",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { color: true, name: true, slug: true },
      sort: "name:asc",
    }),
    payload.find({
      collection: "posts",
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { topics: true },
      where: publishedPostsWhere(),
    }),
  ]);

  const counts = new Map<number, number>();
  for (const post of posts.docs) {
    // A post can list a topic more than once in old relationship rows.
    const topicIds = new Set(
      (post.topics ?? [])
        .map((topic) => getRelationId(topic))
        .filter((id): id is number => typeof id === "number")
    );
    for (const id of topicIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return topics.docs.flatMap((topic) => {
    const postCount = counts.get(topic.id) ?? 0;
    if (!(topic.slug && postCount > 0)) {
      return [];
    }
    return [
      {
        color: topic.color ?? null,
        id: topic.id,
        name: topic.name || topic.slug,
        postCount,
        slug: topic.slug,
      },
    ];
  });
}
