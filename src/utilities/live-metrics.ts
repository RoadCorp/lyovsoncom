import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "@/payload-types";
import {
  publicActivitiesWhere,
  publishedPostsWhere,
} from "@/utilities/content-queries";
import { LIVE_METRICS, type LiveMetric } from "@/utilities/live-metric-options";
import { getPayloadClient } from "@/utilities/payload-client";

// Other sites are counted from their public sitemaps, which list every page
// they want indexed and need no keys or API access.

const FETCH_TIMEOUT_MS = 10_000;
const URL_ENTRY = /<url>/g;
const SITEMAP_LOC = /<loc>([^<]+)<\/loc>/g;

/** Number of <url> entries in a sitemap document. */
export function countSitemapUrls(xml: string) {
  return xml.match(URL_ENTRY)?.length ?? 0;
}

/** <loc> values from a sitemap or sitemap index. */
export function getSitemapLocations(xml: string) {
  return [...xml.matchAll(SITEMAP_LOC)].map((match) => match[1].trim());
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Lyovson.com portfolio metrics" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

async function countAvenewsPublications() {
  const index = await fetchText("https://www.avenews.am/sitemap-index.xml");
  const sitemaps = getSitemapLocations(index).filter((url) =>
    url.includes("/publications-sitemap/")
  );
  if (sitemaps.length === 0) {
    return null;
  }
  const counts = await Promise.all(
    sitemaps.map(async (url) => countSitemapUrls(await fetchText(url)))
  );
  return counts.reduce((total, count) => total + count, 0);
}

async function countConcernedEuReleases() {
  const sitemap = await fetchText("https://www.concernedeu.com/sitemap.xml");
  return getSitemapLocations(sitemap).filter((url) => url.includes("/gallery/"))
    .length;
}

async function readExternalMetric(metric: LiveMetric) {
  "use cache";
  cacheLife("days");

  try {
    const value =
      metric === "avenews-publications"
        ? await countAvenewsPublications()
        : await countConcernedEuReleases();
    return value || null;
  } catch {
    return null;
  }
}

async function readSiteMetric(metric: LiveMetric) {
  "use cache";
  const payload = await getPayloadClient();

  if (metric === "lyovson-posts") {
    cacheTag("posts");
    cacheLife("posts");
    const { totalDocs } = await payload.count({
      collection: "posts",
      overrideAccess: true,
      where: publishedPostsWhere(),
    });
    return totalDocs;
  }

  cacheTag("activities");
  cacheLife("activities");
  const { totalDocs } = await payload.count({
    collection: "activities",
    overrideAccess: true,
    where: publicActivitiesWhere(),
  });
  return totalDocs;
}

function readMetric(metric: LiveMetric) {
  return metric.startsWith("lyovson-")
    ? readSiteMetric(metric)
    : readExternalMetric(metric);
}

type Highlight = NonNullable<Project["highlights"]>[number];

/**
 * Highlights with live values filled in. A metric that can't be read keeps
 * the value typed in the admin, so a card never goes blank.
 */
export function resolveHighlights(
  highlights: Highlight[]
): Promise<Highlight[]> {
  return Promise.all(
    highlights.map(async (highlight) => {
      if (!(highlight.live && highlight.live in LIVE_METRICS)) {
        return highlight;
      }
      const value = await readMetric(highlight.live as LiveMetric).catch(
        () => null
      );
      return value === null
        ? highlight
        : { ...highlight, value: value.toLocaleString("en-US") };
    })
  );
}
