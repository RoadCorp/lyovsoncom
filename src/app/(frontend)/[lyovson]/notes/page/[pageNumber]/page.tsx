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
  return getLyovsonPaginatedStaticParams("notes");
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { lyovson: username, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = getValidPageNumber(pageNumber);

  cacheTag("notes");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-notes-page-${pageNumber}`);
  cacheLife("notes");

  if (!sanitizedPageNumber) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(`/${username}/notes`);
  }

  const response = await getLyovsonFeed({
    username,
    filter: "notes",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return notFound();
  }

  const { user, items, totalItems, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Notes Page ${sanitizedPageNumber}`,
    description: `Public notes by ${user.name} on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/${username}/notes/page/${sanitizedPageNumber}`,
    itemCount: totalItems,
    items: items
      .map((item) => {
        if (item.type === "note" && item.data.slug) {
          return { url: `${getServerSideURL()}/notes/${item.data.slug}` };
        }
        return null;
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <h1 className="sr-only">
        {user.name} notes page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {items.length > 0 ? (
          <LyovsonFeedItems items={items} />
        ) : (
          <GridCardEmptyState
            description={`No notes found on page ${sanitizedPageNumber} for ${user.name}.`}
            title="No Results"
          />
        )}
      </Suspense>

      {totalPages > 1 && (
        <Pagination
          basePath={`/${username}/notes/page`}
          firstPagePath={`/${username}/notes`}
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
    filter: "notes",
    page: sanitizedPageNumber,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response || sanitizedPageNumber > response.totalPages) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const title = `${name} Notes - Page ${sanitizedPageNumber}`;
  const description = `Public notes by ${name} on page ${sanitizedPageNumber}.`;
  const prevPath =
    sanitizedPageNumber === 2
      ? `/${username}/notes`
      : `/${username}/notes/page/${sanitizedPageNumber - 1}`;
  const nextPath =
    sanitizedPageNumber < response.totalPages
      ? `/${username}/notes/page/${sanitizedPageNumber + 1}`
      : undefined;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/notes/page/${sanitizedPageNumber}`,
    prevPath,
    nextPath,
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  });
}
