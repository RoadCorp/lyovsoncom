/**
 * GIPHY search and result helpers for the GIF picker. Picked GIFs are
 * hotlinked from GIPHY's media URLs, unchanged, as its API terms require.
 */

const MAX_QUERY_LENGTH = 50; // GIPHY returns 414 above this
const RATING = "pg-13";

interface GiphyRendition {
  height: string;
  mp4?: string;
  url: string;
  webp?: string;
  width: string;
}

export interface GiphyResult {
  id: string;
  images: {
    fixed_width: GiphyRendition;
    original: GiphyRendition;
    original_still: GiphyRendition;
  };
  title: string;
  url: string;
}

export interface GifVideoData {
  aspectRatio: string;
  mp4Url: string;
  posterUrl: string;
  sourceUrl: string;
}

export async function searchGiphy(
  apiKey: string,
  query: string
): Promise<GiphyResult[]> {
  const q = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (!q) {
    return [];
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    limit: "12",
    q,
    rating: RATING,
  });
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/search?${params}`
  );

  if (!response.ok) {
    throw new Error(`GIPHY API error: ${response.status}`);
  }

  const { data }: { data: GiphyResult[] } = await response.json();
  return data ?? [];
}

export function extractVideoUrls(result: GiphyResult): GifVideoData {
  const { original, original_still: still } = result.images;
  const width = Number(original.width);
  const height = Number(original.height);

  return {
    aspectRatio:
      width && height ? String(Number((width / height).toFixed(4))) : "1",
    mp4Url: original.mp4 || "",
    posterUrl: still.url,
    sourceUrl: result.url,
  };
}
