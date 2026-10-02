import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getSitemapData } from "@/utilities/get-sitemap-data";
import { getContentRoutes, getStaticRoutes } from "@/utilities/sitemap-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheTag("sitemap");
  cacheTag("posts");
  cacheTag("projects");
  cacheTag("topics");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("sitemap");

  const now = new Date();
  const data = await getSitemapData();

  return [...getStaticRoutes(now), ...(await getContentRoutes(data, now))];
}
