import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Topic } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

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
