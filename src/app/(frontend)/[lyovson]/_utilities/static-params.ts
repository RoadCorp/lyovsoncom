import { cacheLife, cacheTag } from "next/cache";
import type { Lyovson } from "@/payload-types";
import {
  getPaginatedStaticParams,
  LYOVSON_ITEMS_PER_PAGE,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import type { LyovsonFilter } from "@/utilities/get-lyovson-feed";
import { getLyovsonFeedCounts } from "@/utilities/get-lyovson-feed";
import { getPayloadClient } from "@/utilities/payload-client";

const PLACEHOLDER_LYOVSON = "__placeholder__";

export async function getLyovsonStaticParams() {
  "use cache";
  cacheTag("lyovsons");
  cacheLife("static");

  const payload = await getPayloadClient();
  const lyovsons = await payload.find({
    collection: "lyovsons",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    select: { username: true },
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
  cacheTag("activities");
  cacheLife("static");

  const lyovsons = await getLyovsonStaticParams();
  const activeLyovsons = lyovsons.filter(
    ({ lyovson }) => lyovson !== PLACEHOLDER_LYOVSON
  );
  const countResults = await Promise.all(
    activeLyovsons.map(async ({ lyovson }) => ({
      counts: await getLyovsonFeedCounts(lyovson),
      lyovson,
    }))
  );
  const params = countResults.flatMap(({ counts, lyovson }) => {
    const totalItems =
      filter === "all" ? (counts?.all ?? 0) : (counts?.[filter] ?? 0);

    return getPaginatedStaticParams(totalItems, LYOVSON_ITEMS_PER_PAGE).map(
      (pageNumber) => ({
        lyovson,
        pageNumber,
      })
    );
  });

  const fallbackLyovson = activeLyovsons[0];

  return ensureStaticParams(params, {
    lyovson: fallbackLyovson?.lyovson || PLACEHOLDER_LYOVSON,
    pageNumber: PLACEHOLDER_LYOVSON,
  });
}
