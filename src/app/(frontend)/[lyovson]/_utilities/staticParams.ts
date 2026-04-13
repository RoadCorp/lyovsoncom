import configPromise from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import type { Lyovson } from "@/payload-types";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  getLyovsonFeed,
  type LyovsonFilter,
} from "@/utilities/get-lyovson-feed";
import { LYOVSON_ITEMS_PER_PAGE } from "./constants";

const PLACEHOLDER_LYOVSON = "__placeholder__";

export async function getLyovsonStaticParams() {
  "use cache";
  cacheTag("lyovsons");
  cacheLife("static");

  const payload = await getPayload({ config: configPromise });
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

    const response = await getLyovsonFeed({
      username: lyovson,
      filter,
      page: 1,
      limit: LYOVSON_ITEMS_PER_PAGE,
    });

    const totalPages = response?.totalPages || 0;
    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      params.push({
        lyovson,
        pageNumber: String(pageNumber),
      });
    }
  }

  const fallbackLyovson = lyovsons.find(
    ({ lyovson }) => lyovson !== PLACEHOLDER_LYOVSON
  );

  return ensureStaticParams(params, {
    lyovson: fallbackLyovson?.lyovson || PLACEHOLDER_LYOVSON,
    pageNumber: fallbackLyovson ? "1" : PLACEHOLDER_LYOVSON,
  });
}
