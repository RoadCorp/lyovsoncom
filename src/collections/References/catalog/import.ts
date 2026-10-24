import type { Payload } from "payload";
import type { Lyovson, Reference } from "@/payload-types";
import { type CatalogItem, USER_AGENT } from "./shared";
import {
  getCommonsImage,
  getWikidataFacts,
  matchWikidata,
  type WikidataLinks,
} from "./wikidata";

/** Who imports: the signed-in editor, or a trusted script without one. */
interface Importer {
  payload: Payload;
  user?: Lyovson;
}

// Covers are fetched only from the catalogs' own image hosts.
const COVER_HOSTS = [
  "covers.openlibrary.org",
  "coverartarchive.org",
  "image.tmdb.org",
  "images.igdb.com",
  ".mzstatic.com",
  "shared.akamai.steamstatic.com",
  "thumb.wikimedia.org",
  "upload.wikimedia.org",
];
const MAX_COVER_BYTES = 10 * 1024 * 1024;

function isCatalogImage(url: string) {
  const { hostname, protocol } = new URL(url);
  return (
    protocol === "https:" &&
    COVER_HOSTS.some((host) =>
      host.startsWith(".") ? hostname.endsWith(host) : hostname === host
    )
  );
}

interface Cover {
  /** Attribution the image's licence asks for. */
  credit?: string;
  name: string;
  title: string;
  url: string;
}

/** Copies a cover into Media so the site never hotlinks a catalog. */
async function saveCover({ payload, user }: Importer, cover: Cover) {
  if (!isCatalogImage(cover.url)) {
    return;
  }
  const response = await fetch(cover.url, {
    // Wikimedia refuses requests that don't name themselves.
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
    // Don't follow redirects: the host allowlist only vets the first URL.
    redirect: "error",
  }).catch(() => null);
  const mimetype = response?.headers.get("content-type") ?? "";
  if (!(response?.ok && mimetype.startsWith("image/"))) {
    return;
  }
  if (Number(response.headers.get("content-length")) > MAX_COVER_BYTES) {
    return;
  }
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > MAX_COVER_BYTES) {
    return;
  }
  const extension = mimetype.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const media = await payload.create({
    collection: "media",
    data: {
      alt: `${cover.title} cover`,
      ...(cover.credit ? { credit: cover.credit } : {}),
    },
    file: {
      data,
      mimetype,
      name: `${cover.name}.${extension}`,
      size: data.length,
    },
    // Payload 4's Local API checks access by default; create as the editor.
    ...(user ? { user } : { overrideAccess: true }),
  });
  return media.id;
}

type Facts = Awaited<ReturnType<typeof getWikidataFacts>>;

const STEAM_ART =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps";

/**
 * The best image for a pick: the catalog's cover, else Steam's box art for
 * a game, else the Wikidata logo or photo from Commons with its credit.
 */
function coverSources(item: CatalogItem, facts: Facts) {
  const name = `${item.source}-${item.sourceId.replaceAll("/", "-")}`;
  const steam = (art: string) =>
    facts.steamAppId
      ? {
          name: `steam-${facts.steamAppId}`,
          title: item.title,
          url: `${STEAM_ART}/${facts.steamAppId}/${art}`,
        }
      : undefined;
  return [
    async (): Promise<Cover | undefined> =>
      item.imageUrl
        ? { name, title: item.title, url: item.imageUrl }
        : undefined,
    async () => steam("library_600x900_2x.jpg"),
    // Older games have only the wide header.
    async () => steam("header.jpg"),
    async (): Promise<Cover | undefined> => {
      const image = facts.commonsFile
        ? await getCommonsImage(facts.commonsFile)
        : undefined;
      return image && { ...image, name: `commons-${name}`, title: item.title };
    },
  ];
}

/**
 * The item's Wikidata links, kept only where the other item is already a
 * reference: import never creates references on its own.
 */
export async function resolveLinks(
  { payload, user }: Importer,
  links: WikidataLinks
) {
  const wikidataIds = [
    ...links.basedOn,
    ...[...links.credits, ...links.members, ...links.partOf].map(
      (link) => link.wikidataId
    ),
  ];
  const unique = [...new Set(wikidataIds)];
  const { docs } =
    unique.length > 0
      ? await payload.find({
          collection: "references",
          depth: 0,
          pagination: false,
          select: { type: true, wikidataId: true },
          where: { wikidataId: { in: unique } },
          ...(user ? { user } : { overrideAccess: true }),
        })
      : { docs: [] };
  const byWikidataId = new Map(docs.map((doc) => [doc.wikidataId, doc]));
  // Each link takes only the kinds of reference its field accepts.
  const linked = <T extends { wikidataId: string }>(
    list: T[],
    accepts: (type: Reference["type"]) => boolean
  ) =>
    list.flatMap(({ wikidataId, ...rest }) => {
      const doc = byWikidataId.get(wikidataId);
      return doc && accepts(doc.type) ? [{ ...rest, id: doc.id }] : [];
    });
  const isAgent = (type: Reference["type"]) =>
    type === "person" || type === "organization";
  const isWork = (type: Reference["type"]) => !isAgent(type);

  return {
    basedOn: [
      ...new Set(
        linked(
          links.basedOn.map((wikidataId) => ({ wikidataId })),
          isWork
        ).map(({ id }) => id)
      ),
    ],
    credits: linked(links.credits, isAgent).map(({ id, role }) => ({
      agent: id,
      role,
    })),
    members: linked(links.members, (type) => type === "person").map(
      ({ id, ...years }) => ({ member: id, ...years })
    ),
    partOf: linked(links.partOf, isWork).map(({ id, position }) => ({
      position,
      whole: id,
    })),
  };
}

export type ImportedLinks = Awaited<ReturnType<typeof resolveLinks>>;

/**
 * The reference fields for a picked result: the catalog's details, its
 * Wikidata item and description when one matches, and the cover in Media
 * when asked for one.
 */
export async function importCatalogItem(
  item: CatalogItem,
  withCover: boolean,
  session: Importer
) {
  const { payload } = session;
  const wikidataId = await matchWikidata(item).catch(() => undefined);
  const facts: Facts = wikidataId
    ? await getWikidataFacts(wikidataId).catch(() => ({}))
    : {};

  let image: number | undefined;
  if (withCover) {
    for (const next of coverSources(item, facts)) {
      try {
        const cover = await next();
        image = cover && (await saveCover(session, cover));
      } catch (error) {
        payload.logger.error({
          err: error,
          msg: "Catalog cover import failed",
        });
      }
      if (image) {
        break;
      }
    }
  }
  const wikidataLinks = facts.links;
  const links = wikidataLinks
    ? await resolveLinks(session, wikidataLinks).catch(() => undefined)
    : undefined;
  const description =
    item.description && item.source === "wikidata"
      ? item.description
      : facts.description;

  return {
    catalogId: item.sourceId,
    catalogSource: item.source,
    // Catalogs send "" when they list no creator.
    creator: item.creator || facts.creator || null,
    // Keep a hand-written description when Wikidata has none.
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(links ? { links } : {}),
    title: item.title,
    url: item.url,
    wikidataId: wikidataId ?? null,
    year: item.year ?? facts.year ?? null,
  };
}
