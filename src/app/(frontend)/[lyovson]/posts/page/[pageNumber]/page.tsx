import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { GridCardEmptyState, SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
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
  return getLyovsonPaginatedStaticParams("posts");
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  cacheTag("posts");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-posts-page-${pageNumber}`);
  cacheLife("posts");

  if (!sanitizedPageNumber) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(`/${username}/posts`);
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

  const { user, items, totalItems, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts Page ${sanitizedPageNumber}`,
    description: `Published posts by ${user.name} on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/${username}/posts/page/${sanitizedPageNumber}`,
    itemCount: totalItems,
    items: items
      .map((item) => {
        if (item.type === "post" && item.data.slug) {
          return { url: `${getServerSideURL()}/posts/${item.data.slug}` };
        }
        return null;
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <h1 className="sr-only">
        {user.name} posts page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {items.length > 0 ? (
          <LyovsonFeedItems items={items} />
        ) : (
          <GridCardEmptyState
            description={`No posts found on page ${sanitizedPageNumber} for ${user.name}.`}
            title="No Results"
          />
        )}
      </Suspense>

      {totalPages > 1 && (
        <Pagination
          basePath={`/${username}/posts/page`}
          firstPagePath={`/${username}/posts`}
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
    filter: "posts",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const title = `${name} Posts - Page ${sanitizedPageNumber}`;
  const description = `Published posts by ${name} on page ${sanitizedPageNumber}.`;
  const prevPath =
    sanitizedPageNumber === 2
      ? `/${username}/posts`
      : `/${username}/posts/page/${sanitizedPageNumber - 1}`;
  const nextPath =
    sanitizedPageNumber < response.totalPages
      ? `/${username}/posts/page/${sanitizedPageNumber + 1}`
      : undefined;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/posts/page/${sanitizedPageNumber}`,
    prevPath,
    nextPath,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  });
}
