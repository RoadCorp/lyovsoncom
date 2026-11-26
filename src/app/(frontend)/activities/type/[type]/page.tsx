import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { GridCardActivityLedger, GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  ACTIVITY_FILTER_ARCHIVE_LABELS,
  ACTIVITY_FILTER_TYPES,
  isActivityFilterType,
} from "@/utilities/activity-type";
import { ACTIVITIES_PER_PAGE } from "@/utilities/archive";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import {
  getActivitiesByType,
  getActivityTypeCounts,
} from "@/utilities/get-activity";
import {
  absoluteUrl,
  activitiesRoute,
  activitiesTypePageRoute,
  activitiesTypeRoute,
  activityUrl,
  homeRoute,
} from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    type: string;
  }>;
}

async function ActivityTypePageContent({ params: paramsPromise }: Args) {
  const { type } = await paramsPromise;
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const [response, counts] = await Promise.all([
    getActivitiesByType(type, 1, ACTIVITIES_PER_PAGE),
    getActivityTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  const description = `${label} logged by the Lyóvson family.`;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${label} Activities`,
    description,
    url: absoluteUrl(activitiesTypeRoute(type)),
    itemCount: totalDocs,
    items: docs
      .map((activity) => {
        const url = activityUrl(activity);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Activities", url: absoluteUrl(activitiesRoute()) },
    { name: label },
  ]);

  return (
    <>
      <h1 className="sr-only">{label} Activities</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardActivityLedger activeType={type} counts={counts} />
      {docs.length > 0 ? (
        <ActivitiesArchive activities={docs} />
      ) : (
        <GridCardEmptyState
          description={`No ${label.toLowerCase()} activities have been logged yet.`}
          title={`No ${label} Yet`}
        />
      )}
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) =>
            activitiesTypePageRoute(type, pageNumber)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export function generateStaticParams() {
  return ACTIVITY_FILTER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { type } = await paramsPromise;
  if (!isActivityFilterType(type)) {
    return buildNotFoundMetadata({
      title: "Activity Type Not Found",
      description: "The requested activity category could not be found.",
    });
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildSeoMetadata({
    title: `${label} Activities`,
    description: `Browse ${label.toLowerCase()} activities logged by the Lyóvson family.`,
    canonicalPath: activitiesTypeRoute(type),
  });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <ActivityTypePageContent {...props} />
    </PublicPageBoundary>
  );
}
