"use server";

import { headers } from "next/headers";
import { isLyovson } from "@/access/is-lyovson";
import { getPayloadClient } from "@/utilities/payload-client";
import { importCatalogItem as importItem } from "./import";
import { type CatalogItem, type ReferenceType, SOURCE_LABELS } from "./shared";
import {
  searchIgdb,
  searchItunesPodcasts,
  searchMusicBrainz,
  searchOpenLibrary,
  searchTmdb,
} from "./sources";
import { searchWikidata } from "./wikidata";

// Server actions are publicly callable, so each one checks for a Lyovson.
async function requireUser() {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!isLyovson(user)) {
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

/**
 * The reference fields for a picked result: the catalog's details, its
 * Wikidata item, description, creator and year, and a cover in Media when
 * asked for one.
 */
export async function importCatalogItem(item: CatalogItem, withCover: boolean) {
  return importItem(item, withCover, await requireUser());
}
