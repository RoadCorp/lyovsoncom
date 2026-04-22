import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ACTIVITIES_PER_PAGE } from "@/utilities/archive";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestActivities } from "@/utilities/get-activity";
import {
  absoluteUrl,
  activitiesPageRoute,
  activitiesRoute,
  activityUrl,
} from "@/utilities/routes";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default async function Page() {
  const response = await getLatestActivities(ACTIVITIES_PER_PAGE);

  if (!response) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Activities & Consumption",
    description:
      "Browse reading, watching, listening, and playing activities logged by the Lyóvson family.",
    url: absoluteUrl(activitiesRoute()),
    itemCount: totalDocs,
    items: docs
      .map((activity) => {
        const url = activityUrl(activity);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">All Activities & Consumption</h1>
      <JsonLd data={collectionPageSchema} />
      <ActivitiesArchive activities={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) => activitiesPageRoute(pageNumber)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "All Activities & Consumption",
    description:
      "Browse reading, watching, listening, and playing activities logged by the Lyóvson family.",
    canonicalPath: activitiesRoute(),
  }),
};
