import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { GridCardEmptyState, SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { getActivityPath } from "@/utilities/activity-path";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import { getServerSideURL } from "@/utilities/getURL";
import { LyovsonFeedItems } from "../../../_components/lyovson-feed-items";
import {
  getValidPageNumber,
  LYOVSON_ITEMS_PER_PAGE,
  MAX_INDEXED_PAGE,
} from "../../../_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../../../_utilities/metadata";
import { getLyovsonPaginatedStaticParams } from "../../../_utilities/staticParams";

interface Args {
  params: Promise<{
    lyovson: string;
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  return getLyovsonPaginatedStaticParams("activities");
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  cacheTag("activities");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-activities-page-${pageNumber}`);
  cacheLife("activities");

  if (!sanitizedPageNumber) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(`/${username}/activities`);
  }

  const response = await getLyovsonFeed({
    username,
    filter: "activities",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return notFound();
  }

  const { user, items, totalItems, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Activities Page ${sanitizedPageNumber}`,
    description: `Activities associated with ${user.name} on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/${username}/activities/page/${sanitizedPageNumber}`,
    itemCount: totalItems,
    items: items
      .map((item) => {
        if (item.type !== "activity") {
          return null;
        }

        const activityPath = getActivityPath(item.data);
        if (!activityPath) {
          return null;
        }

        return { url: `${getServerSideURL()}${activityPath}` };
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <h1 className="sr-only">
        {user.name} activities page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {items.length > 0 ? (
          <LyovsonFeedItems items={items} />
        ) : (
          <GridCardEmptyState
            description={`No activities found on page ${sanitizedPageNumber} for ${user.name}.`}
            title="No Results"
          />
        )}
      </Suspense>

      {totalPages > 1 && (
        <Pagination
          basePath={`/${username}/activities/page`}
          firstPagePath={`/${username}/activities`}
          page={sanitizedPageNumber}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  if (!sanitizedPageNumber || sanitizedPageNumber < 2) {
    return buildLyovsonNotFoundMetadata();
  }

  const response = await getLyovsonFeed({
    username,
    filter: "activities",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const title = `${name} Activities - Page ${sanitizedPageNumber}`;
  const description = `Activities associated with ${name} on page ${sanitizedPageNumber}.`;
  const prevPath =
    sanitizedPageNumber === 2
      ? `/${username}/activities`
      : `/${username}/activities/page/${sanitizedPageNumber - 1}`;
  const nextPath =
    sanitizedPageNumber < response.totalPages
      ? `/${username}/activities/page/${sanitizedPageNumber + 1}`
      : undefined;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/activities/page/${sanitizedPageNumber}`,
    prevPath,
    nextPath,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  });
}
