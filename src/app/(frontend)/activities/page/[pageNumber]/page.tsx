import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import {
  ACTIVITIES_PER_PAGE,
  getPaginatedStaticParams,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import {
  getActivityCount,
  getPaginatedActivities,
} from "@/utilities/get-activity";
import {
  buildPaginatedArchiveMetadata,
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import {
  absoluteUrl,
  activitiesPageRoute,
  activitiesRoute,
  activityUrl,
} from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";

  cacheTag("activities");
  cacheLife("static");

  const { totalDocs } = await getActivityCount();

  return ensureStaticParams(
    getPaginatedStaticParams(totalDocs, ACTIVITIES_PER_PAGE).map(
      (pageNumber) => ({
        pageNumber,
      })
    ),
    { pageNumber: "__placeholder__" }
  );
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const pageState = getPaginatedArchivePageState(pageNumber);

  if (pageState.kind === "notFound") {
    notFound();
  }

  if (pageState.kind === "redirect") {
    redirect(activitiesRoute());
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const response = await getPaginatedActivities(
    sanitizedPageNumber,
    ACTIVITIES_PER_PAGE
  );

  if (
    !response ||
    isPaginatedArchivePageOutOfRange(sanitizedPageNumber, response.totalPages)
  ) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `Activities - Page ${sanitizedPageNumber}`,
    description: `Archive of activities and media logs on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(activitiesPageRoute(sanitizedPageNumber)),
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
      <JsonLd data={collectionPageSchema} />
      <ActivitiesArchive activities={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumberValue) =>
            activitiesPageRoute(pageNumberValue)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise;
  const pageState = getPaginatedArchivePageState(pageNumber);

  if (pageState.kind !== "page") {
    return buildNotFoundMetadata();
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const title = `Activities & Consumption - Page ${sanitizedPageNumber}`;
  const description = `Browse activities - Page ${sanitizedPageNumber}`;

  return buildPaginatedArchiveMetadata({
    canonicalPath: activitiesPageRoute(sanitizedPageNumber),
    description,
    pageNumber: sanitizedPageNumber,
    title,
  });
}
