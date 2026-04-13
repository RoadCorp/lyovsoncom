import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { getActivityPath } from "@/utilities/activity-path";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import {
  getActivityCount,
  getPaginatedActivities,
} from "@/utilities/get-activity";
import { getServerSideURL } from "@/utilities/getURL";

const ACTIVITIES_PER_PAGE = 25;
const MAX_INDEXED_PAGE = 3;

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
  const totalPages = Math.ceil(totalDocs / ACTIVITIES_PER_PAGE);
  const pages: { pageNumber: string }[] = [];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    pages.push({ pageNumber: String(pageNumber) });
  }

  return ensureStaticParams(pages, { pageNumber: "1" });
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  cacheTag("activities");
  cacheTag(`activities-page-${pageNumber}`);
  cacheLife("activities");

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) {
    notFound();
  }
  if (sanitizedPageNumber === 1) {
    redirect("/activities");
  }

  const response = await getPaginatedActivities(
    sanitizedPageNumber,
    ACTIVITIES_PER_PAGE
  );

  if (!response) {
    return notFound();
  }

  const { docs, totalPages, page } = response;
  const collectionPageSchema = generateCollectionPageSchema({
    name: `Activities - Page ${sanitizedPageNumber}`,
    description: `Archive of activities and media logs on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/activities/page/${sanitizedPageNumber}`,
    itemCount: response.totalDocs,
    items: docs
      .map((activity) => {
        const activityPath = getActivityPath(activity);
        if (!activityPath) {
          return null;
        }
        return { url: `${getServerSideURL()}${activityPath}` };
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        <ActivitiesArchive activities={docs} />
      </Suspense>

      {totalPages > 1 && page && (
        <Pagination
          basePath="/activities/page"
          firstPagePath="/activities"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 2) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `Activities & Consumption - Page ${sanitizedPageNumber} | Lyóvson.com`,
    description: `Browse activities - Page ${sanitizedPageNumber}`,
    alternates: {
      canonical: `/activities/page/${sanitizedPageNumber}`,
      ...(sanitizedPageNumber > 1 && {
        prev:
          sanitizedPageNumber === 2
            ? "/activities"
            : `/activities/page/${sanitizedPageNumber - 1}`,
      }),
    },
    openGraph: {
      title: `Activities & Consumption - Page ${sanitizedPageNumber} | Lyóvson.com`,
      description: `Browse activities - Page ${sanitizedPageNumber}`,
      type: "website",
      url: `/activities/page/${sanitizedPageNumber}`,
    },
    twitter: {
      card: "summary",
      title: `Activities & Consumption - Page ${sanitizedPageNumber} | Lyóvson.com`,
      description: `Browse activities - Page ${sanitizedPageNumber}`,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
