import { cacheLife, cacheTag } from "next/cache";
import type { Redirect } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getRedirects(depth = 1): Promise<Redirect[]> {
  "use cache";
  cacheTag("redirects");
  cacheLife("static");

  const payload = await getPayloadClient();
  const { docs: redirects } = await payload.find({
    collection: "redirects",
    depth,
    limit: 0,
    pagination: false,
  });

  return redirects as Redirect[];
}
