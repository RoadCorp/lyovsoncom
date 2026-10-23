import { type CatalogItem, fetchJson, MAX_RESULTS } from "./shared";

// Wikidata is free, keyless and CC0. It is the search for people,
// organizations, series and anything without its own catalog, and every
// imported reference gets a Wikidata item when one can be matched.

const API = "https://www.wikidata.org/w/api.php";
const CREATOR_SEPARATOR = /[,&]/;

/** Wikidata properties that hold each catalog's id. */
const CATALOG_PROPERTIES = {
  igdb: "P9043",
  itunes: "P5842",
  musicBrainz: "P436",
  openLibrary: "P648",
  "tmdb:movie": "P4947",
  "tmdb:tv": "P4983",
} as const;

interface SearchEntity {
  description?: string;
  id: string;
  label?: string;
}

export async function searchWikidata(query: string) {
  const params = new URLSearchParams({
    action: "wbsearchentities",
    format: "json",
    language: "en",
    limit: String(MAX_RESULTS),
    search: query,
    uselang: "en",
  });
  const { search } = await fetchJson<{ search: SearchEntity[] }>(
    `${API}?${params}`
  );

  return search.map(
    (entity): CatalogItem => ({
      description: entity.description,
      source: "wikidata",
      sourceId: entity.id,
      title: entity.label ?? entity.id,
      url: `https://www.wikidata.org/wiki/${entity.id}`,
      wikidataId: entity.id,
    })
  );
}

/** The item that carries this catalog id, e.g. P4947 = 687163. */
async function findByCatalogId(item: CatalogItem) {
  const [kind, id] =
    item.source === "tmdb" ? item.sourceId.split("/") : [null, item.sourceId];
  const key = (kind ? `tmdb:${kind}` : item.source) as
    | keyof typeof CATALOG_PROPERTIES
    | "wikidata";
  if (key === "wikidata" || !(key in CATALOG_PROPERTIES)) {
    return;
  }
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srsearch: `haswbstatement:${CATALOG_PROPERTIES[key]}=${id}`,
  });
  const { query } = await fetchJson<{
    query: { search: { title: string }[] };
  }>(`${API}?${params}`);
  return query.search.length === 1 ? query.search[0].title : undefined;
}

/**
 * A same-titled item whose description names the creator or the year, such
 * as "novel by Jim Butcher". Anything less certain stays unmatched.
 */
async function findByTitle(item: CatalogItem) {
  const clues = [
    ...(item.creator
      ?.split(CREATOR_SEPARATOR)
      .map((name) => name.trim().split(" ").at(-1)) ?? []),
    item.year ? String(item.year) : undefined,
  ].filter((clue): clue is string => Boolean(clue && clue.length > 2));
  if (clues.length === 0) {
    return;
  }
  const candidates = await searchWikidata(item.title);
  const title = item.title.toLowerCase();
  return candidates.find(
    (candidate) =>
      candidate.title.toLowerCase() === title &&
      clues.some((clue) =>
        candidate.description?.toLowerCase().includes(clue.toLowerCase())
      )
  )?.wikidataId;
}

export async function matchWikidata(item: CatalogItem) {
  if (item.wikidataId) {
    return item.wikidataId;
  }
  return (await findByCatalogId(item)) ?? (await findByTitle(item));
}

/** The English description, e.g. "video streaming service by Apple Inc.". */
export async function getWikidataDescription(id: string) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    ids: id,
    languages: "en",
    props: "descriptions",
  });
  const { entities } = await fetchJson<{
    entities: Record<string, { descriptions?: { en?: { value: string } } }>;
  }>(`${API}?${params}`);
  return entities[id]?.descriptions?.en?.value;
}
