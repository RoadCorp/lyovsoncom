import { cacheLife, cacheTag } from "next/cache";
import type { Config } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

type Global = keyof Config["globals"];

export async function getGlobal(slug: Global, depth = 0) {
  "use cache";
  cacheTag(`global_${slug}`);
  cacheLife("static");

  const payload = await getPayloadClient();

  return payload.findGlobal({
    slug,
    depth,
  });
}
