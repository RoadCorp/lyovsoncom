/**
 * Tenor result types and pure helpers shared by the GIF picker and the
 * server action. Nothing here touches the API key.
 */

interface TenorMediaFormat {
  dims: [number, number];
  url: string;
}

export interface TenorResult {
  id: string;
  media_formats: {
    tinygif: TenorMediaFormat;
    mp4: TenorMediaFormat;
    webm?: TenorMediaFormat;
    tinygif_transparent?: TenorMediaFormat;
  };
}

export interface GifVideoData {
  aspectRatio: string;
  mp4Url: string;
  posterUrl: string;
  webmUrl?: string;
}

/**
 * Get full video URLs for a GIF from a Tenor result
 * @param result - Tenor search result
 * @returns Video URLs and metadata
 */
export function extractVideoUrls(result: TenorResult): GifVideoData {
  const media = result.media_formats;

  // Calculate aspect ratio from MP4 dimensions
  const [width, height] = media.mp4?.dims || [];
  const aspectRatio = width && height ? String(width / height) : "1";

  return {
    mp4Url: media.mp4?.url || "",
    webmUrl: media.webm?.url,
    posterUrl: media.tinygif_transparent?.url || media.tinygif?.url || "",
    aspectRatio,
  };
}
