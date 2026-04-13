import { cacheLife, cacheTag } from "next/cache";
import type { Config } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

type Collection = keyof Config["collections"];

export async function getDocument(
  collection: Collection,
  value: number | string
) {
  "use cache";
  cacheTag(collection);
  cacheTag(`${collection}_${value}`);
  cacheLife("static");

  const payload = await getPayloadClient();
  const page = await payload.find({
    collection,
    depth: 0,
    where: {
      OR: [
        {
          slug: {
            equals: String(value),
          },
        },
        {
          id: {
            equals: value,
          },
        },
      ],
    },
  });

  return page.docs[0];
}
