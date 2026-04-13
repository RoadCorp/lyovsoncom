import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  lyovsonPostsPageRoute,
  lyovsonPostsRoute,
  postUrl,
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
  return getLyovsonPaginatedStaticParams("posts");
}

export default async function Page({ params: paramsPromise }: Args) {
  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(lyovsonPostsRoute(username));
  }

  const response = await getLyovsonFeed({
    username,
    filter: "posts",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts Page ${sanitizedPageNumber}`,
    description: `Published posts by ${user.name} on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(lyovsonPostsPageRoute(username, sanitizedPageNumber)),
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
      <Pagination
        getPageHref={(pageNumberValue) =>
          lyovsonPostsPageRoute(username, pageNumberValue)
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
    canonicalPath: lyovsonPostsPageRoute(username, sanitizedPageNumber),
    prevPath:
      sanitizedPageNumber === 2
        ? lyovsonPostsRoute(username)
        : lyovsonPostsPageRoute(username, sanitizedPageNumber - 1),
    nextPath:
      sanitizedPageNumber < response.totalPages
        ? lyovsonPostsPageRoute(username, sanitizedPageNumber + 1)
        : undefined,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: true,
    },
  });
}
