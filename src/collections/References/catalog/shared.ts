import type { Reference } from "@/payload-types";

export type ReferenceType = Reference["type"];

export type CatalogSource = NonNullable<Reference["catalogSource"]>;

/** A search result from one of the free catalogs, before it is imported. */
export interface CatalogItem {
  creator?: string;
  description?: string;
  /** Cover or poster to copy into Media on import. */
  imageUrl?: string;
  source: CatalogSource;
  sourceId: string;
  /** Smaller image for the result list. */
  thumbUrl?: string;
  title: string;
  url: string;
  wikidataId?: string;
  year?: number;
}

export const SOURCE_LABELS: Record<CatalogSource, string> = {
  igdb: "IGDB",
  itunes: "Apple Podcasts",
  musicBrainz: "MusicBrainz",
  openLibrary: "Open Library",
  tmdb: "TMDB",
  wikidata: "Wikidata",
};

// Open Library, MusicBrainz and Wikidata ask clients to name themselves.
export const USER_AGENT =
  "lyovson.com/1.0 (https://www.lyovson.com; rafa@lyovson.com)";
const TIMEOUT_MS = 8000;
export const MAX_RESULTS = 8;

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "User-Agent": USER_AGENT, ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${new URL(url).hostname} answered ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function yearOf(date: string | number | undefined | null) {
  const year = Number.parseInt(String(date ?? "").slice(0, 4), 10);
  return Number.isNaN(year) ? undefined : year;
}
