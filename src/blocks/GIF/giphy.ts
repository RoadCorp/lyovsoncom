/**
 * GIPHY search and result helpers for the GIF picker. Picked GIFs are
 * hotlinked from GIPHY's media URLs, unchanged, as its API terms require.
 */

const MAX_QUERY_LENGTH = 50; // GIPHY returns 414 above this
const RATING = "pg-13";
// Titles read like "Mind Blown GIF by The Daily Show".
const TITLE_SUFFIX = /\s+GIF(\s+by\s+.*)?$/i;

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
  alt: string;
  aspectRatio: string;
  mp4Url: string;
  posterUrl: string;
  sourceUrl: string;
}

/** Width / height, rounded so it reads well in the CMS. */
export function formatAspectRatio(width: number, height: number): string {
  return String(Number((width / height).toFixed(4)));
}

/**
 * GIPHY's stable media URLs for an id. Search results carry per-request
 * tracking URLs; these canonical ones serve the same files.
 */
export function giphyMediaUrls(id: string) {
  const base = `https://media.giphy.com/media/${id}`;
  return {
    mp4Url: `${base}/giphy.mp4`,
    posterUrl: `${base}/giphy_s.gif`,
    sourceUrl: `https://giphy.com/gifs/${id}`,
  };
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
  const { original } = result.images;
  const width = Number(original.width);
  const height = Number(original.height);

  return {
    alt: result.title.replace(TITLE_SUFFIX, "").trim(),
    aspectRatio: width && height ? formatAspectRatio(width, height) : "1",
    ...giphyMediaUrls(result.id),
  };
}
