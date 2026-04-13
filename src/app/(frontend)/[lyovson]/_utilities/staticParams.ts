import { cacheLife, cacheTag } from "next/cache";
import type { Lyovson } from "@/payload-types";
import {
  getPaginatedStaticParams,
  LYOVSON_ITEMS_PER_PAGE,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  getLyovsonFeedCounts,
  type LyovsonFilter,
} from "@/utilities/get-lyovson-feed";
import { getPayloadClient } from "@/utilities/payload-client";

const PLACEHOLDER_LYOVSON = "__placeholder__";

export async function getLyovsonStaticParams() {
  "use cache";
  cacheTag("lyovsons");
  cacheLife("static");

  const payload = await getPayloadClient();
  const lyovsons = await payload.find({
    collection: "lyovsons",
    limit: 100,
    overrideAccess: true,
  });

  return ensureStaticParams(
    lyovsons.docs
      .filter(
        (lyovson): lyovson is Lyovson =>
          typeof lyovson === "object" &&
          "username" in lyovson &&
          !!lyovson.username
      )
      .map((lyovson) => ({
        lyovson: lyovson.username as string,
      })),
    { lyovson: PLACEHOLDER_LYOVSON }
  );
}

export async function getLyovsonPaginatedStaticParams(filter: LyovsonFilter) {
  "use cache";
  cacheTag("lyovsons");
  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheLife("static");

  const lyovsons = await getLyovsonStaticParams();
  const params: { lyovson: string; pageNumber: string }[] = [];

  for (const { lyovson } of lyovsons) {
    if (lyovson === PLACEHOLDER_LYOVSON) {
      continue;
    }

    const counts = await getLyovsonFeedCounts(lyovson);
    const totalItems =
      filter === "all" ? (counts?.all ?? 0) : (counts?.[filter] ?? 0);

    for (const pageNumber of getPaginatedStaticParams(
      totalItems,
      LYOVSON_ITEMS_PER_PAGE
    )) {
      params.push({
        lyovson,
        pageNumber,
      });
    }
  }

  const fallbackLyovson = lyovsons.find(
    ({ lyovson }) => lyovson !== PLACEHOLDER_LYOVSON
  );

  return ensureStaticParams(params, {
    lyovson: fallbackLyovson?.lyovson || PLACEHOLDER_LYOVSON,
    pageNumber: PLACEHOLDER_LYOVSON,
  });
}
