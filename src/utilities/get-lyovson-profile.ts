import { cacheLife, cacheTag } from "next/cache";
import type { Lyovson, LyovsonsSelect } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export const publicProfileSelect = {
  name: true,
  username: true,
  avatar: true,
  font: true,
  quote: true,
  bio: true,
  socialLinks: true,
} as const satisfies LyovsonsSelect;

export type PublicProfile = Pick<
  Lyovson,
  "id" | keyof typeof publicProfileSelect
>;

export async function getLyovsonProfile(
  username: string
): Promise<PublicProfile | null> {
  "use cache";
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheLife("authors");

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "lyovsons",
    select: publicProfileSelect,
    pagination: false,
    where: {
      username: {
        equals: username,
      },
    },
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] || null;
}
