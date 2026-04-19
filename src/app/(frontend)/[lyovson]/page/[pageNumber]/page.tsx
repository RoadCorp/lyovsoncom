import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  GridCardEmptyState,
  LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestLyovsonActivities } from "@/utilities/get-activity";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  lyovsonPageRoute,
  lyovsonRoute,
  postUrl,
} from "@/utilities/routes";
import { LyovsonFeedItems } from "../../_components/lyovson-feed-items";
import {
  getValidPageNumber,
  LYOVSON_ITEMS_PER_PAGE,
  MAX_INDEXED_PAGE,
} from "../../_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../../_utilities/metadata";
import { getLyovsonPaginatedStaticParams } from "../../_utilities/staticParams";

interface Args {
  params: Promise<{
    lyovson: string;
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  return getLyovsonPaginatedStaticParams("posts");
}

export default async function Page({ params: paramsPromise }: Args) {
  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(lyovsonRoute(username));
  }

  const [response, activities] = await Promise.all([
    getLyovsonFeed({
      username,
      filter: "posts",
      page: sanitizedPageNumber,
      limit: LYOVSON_ITEMS_PER_PAGE,
    }),
    getLatestLyovsonActivities(username, ACTIVITY_PREVIEW_LIMIT),
  ]);

  if (!response || sanitizedPageNumber > response.totalPages) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;
  const hasActivitiesPreview = activities.length > 0;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts Page ${sanitizedPageNumber}`,
    description: `Published posts by ${user.name} on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(lyovsonPageRoute(username, sanitizedPageNumber)),
    itemCount: totalItems,
    items: items
      .map((item) =>
        item.type === "post" && item.data.slug
          ? { url: postUrl(item.data.slug) }
          : null
      )
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">
        {user.name} posts page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No posts found on page ${sanitizedPageNumber} for ${user.name}.`}
          title="No Results"
        />
      )}
      <GridCardActivitiesPreview
        activities={activities}
        className={LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
      />
      <Pagination
        className={
          hasActivitiesPreview
            ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
            : undefined
        }
        getPageHref={(pageNumberValue) =>
          lyovsonPageRoute(username, pageNumberValue)
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
    filter: "posts",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;

  return buildLyovsonMetadata({
    title: `${name} Posts - Page ${sanitizedPageNumber}`,
    description: `Published posts by ${name} on page ${sanitizedPageNumber}.`,
    canonicalPath: lyovsonPageRoute(username, sanitizedPageNumber),
    prevPath:
      sanitizedPageNumber === 2
        ? lyovsonRoute(username)
        : lyovsonPageRoute(username, sanitizedPageNumber - 1),
    nextPath:
      sanitizedPageNumber < response.totalPages
        ? lyovsonPageRoute(username, sanitizedPageNumber + 1)
        : undefined,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: true,
    },
  });
}
