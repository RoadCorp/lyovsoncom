import { type CatalogItem, fetchJson, MAX_RESULTS, yearOf } from "./shared";

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

/** Who made a work, in the order a byline should prefer. */
const CREATOR_PROPERTIES = ["P50", "P178", "P57", "P175", "P170"];
const MAX_CREATORS = 2;

interface Claim {
  mainsnak: { datavalue?: { value: unknown } };
  rank: "preferred" | "normal" | "deprecated";
}

interface Entity {
  claims?: Record<string, Claim[]>;
  descriptions?: { en?: { value: string } };
  labels?: { en?: { value: string } };
}

async function getEntities(ids: string[], props: string) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    ids: ids.join("|"),
    languages: "en",
    props,
  });
  const { entities } = await fetchJson<{ entities: Record<string, Entity> }>(
    `${API}?${params}`
  );
  return entities;
}

/** The preferred values of a property, else its normal ones. */
function values(entity: Entity, property: string) {
  const claims = (entity.claims?.[property] ?? []).filter(
    (claim) => claim.rank !== "deprecated" && claim.mainsnak.datavalue
  );
  const preferred = claims.filter((claim) => claim.rank === "preferred");
  return (preferred.length > 0 ? preferred : claims).map(
    (claim) => claim.mainsnak.datavalue?.value
  );
}

/**
 * What a catalog doesn't carry: the English description, an image (a Steam
 * app for games, a Commons logo or photo otherwise), and for items picked
 * from Wikidata itself, the creator and year.
 */
export async function getWikidataFacts(id: string) {
  const entity = (await getEntities([id], "claims|descriptions"))[id];
  if (!entity) {
    return {};
  }
  const [steamAppId] = values(entity, "P1733") as string[];
  const [logo] = values(entity, "P154") as string[];
  const [photo] = values(entity, "P18") as string[];
  const [date] = [...values(entity, "P577"), ...values(entity, "P571")] as {
    time: string;
  }[];
  const creatorIds = (
    CREATOR_PROPERTIES.map((property) => values(entity, property)).find(
      (found) => found.length > 0
    ) ?? []
  )
    .slice(0, MAX_CREATORS)
    .map((value) => (value as { id: string }).id);
  const creators =
    creatorIds.length > 0
      ? await getEntities(creatorIds, "labels")
          .then((labels) =>
            creatorIds.map((creatorId) => labels[creatorId]?.labels?.en?.value)
          )
          // A failed label lookup costs the creator, not the other facts.
          .catch(() => [])
      : [];

  return {
    commonsFile: logo ?? photo,
    creator: creators.filter(Boolean).join(", ") || undefined,
    description: entity.descriptions?.en?.value,
    steamAppId,
    // Wikidata times look like "+2011-11-11T00:00:00Z"; skip BCE dates.
    year: date?.time.startsWith("+") ? yearOf(date.time.slice(1)) : undefined,
  };
}

interface CommonsPage {
  imageinfo?: {
    extmetadata?: Record<string, { value: string } | undefined>;
    thumburl?: string;
  }[];
}

const TAGS = /<[^>]+>/g;
const ENTITIES = /&(?:#(\d+)|#x([\da-f]+)|(amp|apos|gt|lt|nbsp|quot));/gi;
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};
const SPACES = /\s+/g;
const MAX_ARTIST_LENGTH = 80;

/** An 800px rendering of a Commons file, with the credit its licence asks for. */
export async function getCommonsImage(file: string) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    iiextmetadatafilter: "Artist|LicenseShortName",
    iiprop: "url|extmetadata",
    iiurlwidth: "800",
    prop: "imageinfo",
    titles: `File:${file}`,
  });
  const { query } = await fetchJson<{
    query: { pages: Record<string, CommonsPage> };
  }>(`https://commons.wikimedia.org/w/api.php?${params}`);
  const info = Object.values(query.pages)[0]?.imageinfo?.[0];
  if (!info?.thumburl) {
    return;
  }
  const artist = info.extmetadata?.Artist?.value
    .replace(TAGS, "")
    .replace(ENTITIES, (_, decimal, hex, name) =>
      name
        ? NAMED_ENTITIES[name.toLowerCase()]
        : String.fromCodePoint(
            Number.parseInt(decimal ?? hex, decimal ? 10 : 16)
          )
    )
    .replace(SPACES, " ")
    .trim();
  const shortArtist =
    artist && artist.length > MAX_ARTIST_LENGTH
      ? `${artist.slice(0, MAX_ARTIST_LENGTH - 1).trimEnd()}…`
      : artist;
  const license = info.extmetadata?.LicenseShortName?.value;
  return {
    // The licence leads so a clamped line still shows it.
    credit: [
      license,
      shortArtist
        ? `${shortArtist}, via Wikimedia Commons`
        : "Wikimedia Commons",
    ]
      .filter(Boolean)
      .join(" · "),
    url: info.thumburl,
  };
}
