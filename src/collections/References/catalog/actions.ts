"use server";

import { headers } from "next/headers";
import { getPayloadClient } from "@/utilities/payload-client";
import { type CatalogItem, type ReferenceType, SOURCE_LABELS } from "./shared";
import {
  searchIgdb,
  searchItunesPodcasts,
  searchMusicBrainz,
  searchOpenLibrary,
  searchTmdb,
} from "./sources";
import {
  getWikidataDescription,
  matchWikidata,
  searchWikidata,
} from "./wikidata";

// Server actions are publicly callable, so each one checks for a CMS user.
async function requireUser() {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { payload, user };
}

const hasTmdb = () => Boolean(process.env.TMDB_READ_TOKEN);
const hasIgdb = () =>
  Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);

/** The catalog searched for each type; Wikidata covers the rest. */
function catalogFor(type: ReferenceType) {
  switch (type) {
    case "book":
      return { label: SOURCE_LABELS.openLibrary, search: searchOpenLibrary };
    case "movie":
    case "tvShow":
      if (hasTmdb()) {
        const kind = type === "movie" ? "movie" : "tv";
        return {
          label: SOURCE_LABELS.tmdb,
          search: (query: string) => searchTmdb(query, kind),
        };
      }
      break;
    case "videoGame":
      if (hasIgdb()) {
        return { label: SOURCE_LABELS.igdb, search: searchIgdb };
      }
      break;
    case "music":
      return { label: SOURCE_LABELS.musicBrainz, search: searchMusicBrainz };
    case "podcast":
      return { label: SOURCE_LABELS.itunes, search: searchItunesPodcasts };
    default:
      break;
  }
  return { label: SOURCE_LABELS.wikidata, search: searchWikidata };
}

export async function getCatalogLabel(type: ReferenceType) {
  await requireUser();
  return catalogFor(type).label;
}

export async function searchCatalog(type: ReferenceType, query: string) {
  await requireUser();
  const { label, search } = catalogFor(type);
  try {
    return { items: await search(query.trim()) };
  } catch {
    return { error: `${label} didn't answer. Try again in a moment.` };
  }
}

// Covers are fetched only from the catalogs' own image hosts.
const COVER_HOSTS = [
  "covers.openlibrary.org",
  "coverartarchive.org",
  "image.tmdb.org",
  "images.igdb.com",
  ".mzstatic.com",
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

/** Copies a cover into Media so the site never hotlinks a catalog. */
async function saveCover(
  { payload, user }: Awaited<ReturnType<typeof requireUser>>,
  item: CatalogItem
) {
  if (!(item.imageUrl && isCatalogImage(item.imageUrl))) {
    return;
  }
  const response = await fetch(item.imageUrl, {
    signal: AbortSignal.timeout(15_000),
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
    data: { alt: `${item.title} cover` },
    file: {
      data,
      mimetype,
      name: `${item.source}-${item.sourceId.replaceAll("/", "-")}.${extension}`,
      size: data.length,
    },
    // Payload 4's Local API checks access by default; create as the editor.
    user,
  });
  return media.id;
}

/**
 * The reference fields for a picked result: the catalog's details, its
 * Wikidata item and description when one matches, and the cover in Media
 * when asked for one.
 */
export async function importCatalogItem(item: CatalogItem, withCover: boolean) {
  const session = await requireUser();
  const { payload } = session;
  const [wikidataId, image] = await Promise.all([
    matchWikidata(item).catch(() => undefined),
    withCover
      ? saveCover(session, item).catch((error) => {
          payload.logger.error({
            err: error,
            msg: "Catalog cover import failed",
          });
        })
      : undefined,
  ]);
  const description =
    item.description && item.source === "wikidata"
      ? item.description
      : wikidataId &&
        (await getWikidataDescription(wikidataId).catch(() => undefined));

  return {
    catalogId: item.sourceId,
    catalogSource: item.source,
    creator: item.creator ?? null,
    // Keep a hand-written description when Wikidata has none.
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    title: item.title,
    url: item.url,
    wikidataId: wikidataId ?? null,
    year: item.year ?? null,
  };
}
