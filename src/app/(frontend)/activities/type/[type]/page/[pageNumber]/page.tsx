import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { GridCardActivityLedger } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  ACTIVITY_FILTER_ARCHIVE_LABELS,
  ACTIVITY_FILTER_TYPES,
  isActivityFilterType,
} from "@/utilities/activity-type";
import {
  ACTIVITIES_PER_PAGE,
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
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
    pageNumber: string;
    type: string;
  }>;
}

async function ActivityTypePaginatedContent({ params: paramsPromise }: Args) {
  const { pageNumber: rawPageNumber, type } = await paramsPromise;
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (pageNumber === null) {
    return notFound();
  }
  if (pageNumber === 1) {
    redirect(activitiesTypeRoute(type));
  }

  const [response, counts] = await Promise.all([
    getActivitiesByType(type, pageNumber, ACTIVITIES_PER_PAGE),
    getActivityTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  if (docs.length === 0 || pageNumber > totalPages) {
    return notFound();
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  const description = `${label} activities logged by the Lyóvson family — Page ${pageNumber}.`;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${label} Activities — Page ${pageNumber}`,
    description,
    url: absoluteUrl(activitiesTypePageRoute(type, pageNumber)),
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
    { name: label, url: absoluteUrl(activitiesTypeRoute(type)) },
    { name: `Page ${pageNumber}` },
  ]);

  return (
    <>
      <h1 className="sr-only">
        {label} Activities — Page {pageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardActivityLedger activeType={type} counts={counts} />
      <ActivitiesArchive activities={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(nextPage) => activitiesTypePageRoute(type, nextPage)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("activities");
  cacheLife("static");

  const counts = await getActivityTypeCounts();
  const params = ACTIVITY_FILTER_TYPES.flatMap((type) =>
    getPaginatedStaticParams(counts[type] ?? 0, ACTIVITIES_PER_PAGE).map(
      (pageNumber) => ({ pageNumber, type })
    )
  );

  return ensureStaticParams(params, {
    pageNumber: "__placeholder__",
    type: "read",
  });
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber: rawPageNumber, type } = await paramsPromise;
  const pageNumber = parsePageNumber(rawPageNumber);

  if (!(isActivityFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested activity page could not be found.",
    });
  }

  const response = await getActivitiesByType(
    type,
    pageNumber,
    ACTIVITIES_PER_PAGE
  );
  if (response.docs.length === 0 || pageNumber > response.totalPages) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested activity page could not be found.",
    });
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildSeoMetadata({
    title: `${label} Activities - Page ${pageNumber}`,
    description: `Browse ${label.toLowerCase()} activities logged by the Lyóvson family - Page ${pageNumber}.`,
    canonicalPath: activitiesTypePageRoute(type, pageNumber),
    prevPath: activitiesTypePageRoute(type, pageNumber - 1),
    nextPath:
      pageNumber < response.totalPages
        ? activitiesTypePageRoute(type, pageNumber + 1)
        : undefined,
    robots:
      pageNumber > MAX_INDEXED_PAGE
        ? { index: false, follow: true }
        : undefined,
  });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <ActivityTypePaginatedContent {...props} />
    </PublicPageBoundary>
  );
}
