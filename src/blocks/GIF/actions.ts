"use server";

/**
 * Server Actions for GIF Block
 *
 * These actions handle Tenor API interactions server-side
 * to keep API keys secure and enable proper caching
 */

import { headers } from "next/headers";
import { getPayloadClient } from "@/utilities/payload-client";
import type { TenorResult } from "./tenor";

const MAX_QUERY_LENGTH = 100;

interface TenorSearchResponse {
  results: TenorResult[];
}

/**
 * Search for GIFs on Tenor. Server actions are publicly callable, so this
 * requires a signed-in CMS user to protect the Tenor quota.
 * @param query - Search query string
 * @returns Array of GIF results with thumbnails and metadata
 */
export async function searchGifs(query: string): Promise<TenorResult[]> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    throw new Error("Unauthorized");
  }

  const trimmedQuery = query?.trim().slice(0, MAX_QUERY_LENGTH);

  if (!trimmedQuery) {
    return [];
  }

  if (!process.env.TENOR_API_KEY) {
    throw new Error("TENOR_API_KEY not configured");
  }

  const response = await fetch(
    `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(trimmedQuery)}&key=${process.env.TENOR_API_KEY}&limit=12&media_filter=tinygif,mp4,webm`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error(`Tenor API error: ${response.status}`);
  }

  const data: TenorSearchResponse = await response.json();

  return data.results || [];
}
