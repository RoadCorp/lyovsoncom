import type { CreditRole } from "../fields/relations";
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

interface Snak {
  datavalue?: { value: unknown };
}

interface Claim {
  mainsnak: Snak;
  qualifiers?: Record<string, Snak[]>;
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

/** The preferred claims of a property, else its normal ones. */
function claimsOf(entity: Entity, property: string) {
  const claims = (entity.claims?.[property] ?? []).filter(
    (claim) => claim.rank !== "deprecated" && claim.mainsnak.datavalue
  );
  const preferred = claims.filter((claim) => claim.rank === "preferred");
  return preferred.length > 0 ? preferred : claims;
}

function values(entity: Entity, property: string) {
  return claimsOf(entity, property).map(
    (claim) => claim.mainsnak.datavalue?.value
  );
}

function itemId(snak: Snak) {
  return (snak.datavalue?.value as { id?: string } | undefined)?.id;
}

function qualifier(claim: Claim, property: string) {
  return claim.qualifiers?.[property]?.[0]?.datavalue?.value;
}

/** Wikidata times look like "+2011-11-11T00:00:00Z"; BCE dates are skipped. */
function yearOfTime(value: unknown) {
  const time = (value as { time?: string } | undefined)?.time;
  return time?.startsWith("+") ? yearOf(time.slice(1)) : undefined;
}

/**
 * The credit role each Wikidata property stands for, in the order a byline
 * prefers when one person holds several: Stardew Valley's developer is
 * also its director and creator.
 */
const CREDIT_PROPERTIES: [string, CreditRole][] = [
  ["P50", "author"],
  ["P178", "developer"],
  ["P175", "performer"],
  ["P371", "host"],
  ["P57", "director"],
  ["P170", "creator"],
  ["P655", "translator"],
  ["P2438", "narrator"],
];
// P179 is "part of the series", P361 "part of"; P1545 is the ordinal.
const PART_OF_PROPERTIES = ["P179", "P361"];

/**
 * The item's links to other items: who made it, what it belongs to, what it
 * adapts and, for a group, its members. Import keeps only the ones that
 * already exist as references.
 */
function linksOf(entity: Entity) {
  return {
    basedOn: claimsOf(entity, "P144").flatMap((claim) => {
      const id = itemId(claim.mainsnak);
      return id ? [id] : [];
    }),
    credits: CREDIT_PROPERTIES.flatMap(([property, role]) =>
      claimsOf(entity, property).flatMap((claim) => {
        const id = itemId(claim.mainsnak);
        return id ? [{ role, wikidataId: id }] : [];
      })
    ).filter(
      (credit, index, credits) =>
        credits.findIndex((first) => first.wikidataId === credit.wikidataId) ===
        index
    ),
    // P527 "has part(s)" lists a band's members, with when they played.
    members: claimsOf(entity, "P527").flatMap((claim) => {
      const id = itemId(claim.mainsnak);
      return id
        ? [
            {
              end: yearOfTime(qualifier(claim, "P582")),
              start: yearOfTime(qualifier(claim, "P580")),
              wikidataId: id,
            },
          ]
        : [];
    }),
    partOf: PART_OF_PROPERTIES.flatMap((property) =>
      claimsOf(entity, property).flatMap((claim) => {
        const id = itemId(claim.mainsnak);
        const ordinal = Number.parseFloat(
          String(qualifier(claim, "P1545") ?? "")
        );
        return id
          ? [
              {
                position: Number.isNaN(ordinal) ? undefined : ordinal,
                wikidataId: id,
              },
            ]
          : [];
      })
    ),
  };
}

export type WikidataLinks = ReturnType<typeof linksOf>;

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
  const [date] = [...values(entity, "P577"), ...values(entity, "P571")];
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
    links: linksOf(entity),
    steamAppId,
    year: yearOfTime(date),
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
