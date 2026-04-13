import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  activityUrl,
  lyovsonActivitiesPageRoute,
  lyovsonActivitiesRoute,
} from "@/utilities/routes";
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
  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(lyovsonActivitiesRoute(username));
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

  const { items, totalItems, totalPages, user } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Activities Page ${sanitizedPageNumber}`,
    description: `Activities associated with ${user.name} on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(lyovsonActivitiesPageRoute(username, sanitizedPageNumber)),
    itemCount: totalItems,
    items: items
      .map((item) =>
        item.type === "activity"
          ? (() => {
              const url = activityUrl(item.data);
              return url ? { url } : null;
            })()
          : null
      )
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">
        {user.name} activities page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No activities found on page ${sanitizedPageNumber} for ${user.name}.`}
          title="No Results"
        />
      )}
      <Pagination
        getPageHref={(pageNumberValue) =>
          lyovsonActivitiesPageRoute(username, pageNumberValue)
        }
        page={sanitizedPageNumber}
        totalPages={totalPages}
      />
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
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

  return buildLyovsonMetadata({
    title: `${name} Activities - Page ${sanitizedPageNumber}`,
    description: `Activities associated with ${name} on page ${sanitizedPageNumber}.`,
    canonicalPath: lyovsonActivitiesPageRoute(username, sanitizedPageNumber),
    prevPath:
      sanitizedPageNumber === 2
        ? lyovsonActivitiesRoute(username)
        : lyovsonActivitiesPageRoute(username, sanitizedPageNumber - 1),
    nextPath:
      sanitizedPageNumber < response.totalPages
        ? lyovsonActivitiesPageRoute(username, sanitizedPageNumber + 1)
        : undefined,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: true,
    },
  });
}
