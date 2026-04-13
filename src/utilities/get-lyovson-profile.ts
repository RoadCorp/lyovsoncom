import { cacheLife, cacheTag } from "next/cache";
import type { Lyovson } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getLyovsonProfile(
  username: string
): Promise<Lyovson | null> {
  "use cache";
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheLife("authors");

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "lyovsons",
    where: {
      username: {
        equals: username,
      },
    },
    limit: 1,
    overrideAccess: true,
  });

  return (result.docs[0] as Lyovson) || null;
}
