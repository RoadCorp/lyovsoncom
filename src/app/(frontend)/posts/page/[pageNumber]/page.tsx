import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

import { CollectionArchive } from "@/components/CollectionArchive";
import { SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getPaginatedPosts, getPostCount } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";

const POSTS_PER_PAGE = 25;
const MAX_INDEXED_PAGE = 3;

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  // Add cache tags for this specific posts page
  cacheTag("posts");
  cacheTag(`posts-page-${pageNumber}`);
  cacheLife("posts");

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) {
    notFound();
  }
  if (sanitizedPageNumber === 1) {
    redirect("/posts");
  }

  const response = await getPaginatedPosts(sanitizedPageNumber, POSTS_PER_PAGE);

  if (!response) {
    return notFound();
  }

  const { docs, totalPages, page } = response;
  const collectionPageSchema = generateCollectionPageSchema({
    name: `All Posts - Page ${sanitizedPageNumber}`,
    description: `Archive of posts and articles on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/posts/page/${sanitizedPageNumber}`,
    itemCount: response.totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${getServerSideURL()}/posts/${post.slug}`,
      })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        <CollectionArchive posts={docs} />
      </Suspense>

      {totalPages > 1 && page && (
        <Pagination
          basePath="/posts/page"
          firstPagePath="/posts"
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
  const pageNum = Number(pageNumber);

  // Add cache tags for metadata
  cacheTag("posts");
  cacheLife("static");

  const isFirstPage = pageNum === 1;
  const title = isFirstPage
    ? "All Posts & Articles | Lyovson.com"
    : `Posts Page ${pageNumber} | Lyovson.com`;

  const description = isFirstPage
    ? "Browse all posts and articles from Lyovson.com covering programming, design, philosophy, and technology."
    : `Posts and articles from Lyovson.com - Page ${pageNumber}. Continue browsing our content on programming, design, and technology.`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    alternates: {
      canonical: isFirstPage ? "/posts" : `/posts/page/${pageNumber}`,
      ...(pageNum > 1 && {
        prev: pageNum === 2 ? "/posts" : `/posts/page/${pageNum - 1}`,
      }),
      // Note: We'd need to know total pages to set 'next', but this is handled by Pagination component
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: isFirstPage ? "/posts" : `/posts/page/${pageNumber}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@lyovson",
    },
    robots: {
      index: pageNum <= MAX_INDEXED_PAGE, // Only index first 3 pages to avoid duplicate content issues
      follow: true,
      noarchive: pageNum > 1, // Don't archive pagination pages
    },
  };
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("posts");
  cacheLife("static"); // Build-time data doesn't change often

  const { totalDocs } = await getPostCount();
  const totalPages = Math.ceil(totalDocs / POSTS_PER_PAGE);

  const pages: { pageNumber: string }[] = [];

  for (let i = 2; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) });
  }

  return ensureStaticParams(pages, { pageNumber: "1" });
}
