"use server";

import { headers } from "next/headers";
import { isLyovson } from "@/access/is-lyovson";
import { getPayloadClient } from "@/utilities/payload-client";

/**
 * GIPHY requires search requests to come from the browser, not a proxy, so
 * the picker calls GIPHY directly. Server actions are publicly callable, so
 * the key goes only to a signed-in CMS user rather than into the bundle.
 */
export async function getGiphyApiKey(): Promise<string> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (!isLyovson(user)) {
    throw new Error("Unauthorized");
  }

  if (!process.env.GIPHY_API_KEY) {
    throw new Error("GIPHY_API_KEY not configured");
  }

  return process.env.GIPHY_API_KEY;
}
