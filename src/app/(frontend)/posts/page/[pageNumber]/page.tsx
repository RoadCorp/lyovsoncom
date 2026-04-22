import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { getPaginatedStaticParams, POSTS_PER_PAGE } from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getPaginatedPosts, getPostCount } from "@/utilities/get-post";
import {
  buildPaginatedArchiveMetadata,
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import {
  absoluteUrl,
  postsPageRoute,
  postsRoute,
  postUrl,
} from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const pageState = getPaginatedArchivePageState(pageNumber);

  if (pageState.kind === "notFound") {
    notFound();
  }

  if (pageState.kind === "redirect") {
    redirect(postsRoute());
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const response = await getPaginatedPosts(sanitizedPageNumber, POSTS_PER_PAGE);

  if (
    !response ||
    isPaginatedArchivePageOutOfRange(sanitizedPageNumber, response.totalPages)
  ) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `All Posts - Page ${sanitizedPageNumber}`,
    description: `Archive of posts and articles on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(postsPageRoute(sanitizedPageNumber)),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumberValue) => postsPageRoute(pageNumberValue)}
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
  const title = `Posts Page ${sanitizedPageNumber}`;
  const description = `Posts and articles from Lyovson.com - Page ${sanitizedPageNumber}. Continue browsing our content on programming, design, and technology.`;

  return buildPaginatedArchiveMetadata({
    canonicalPath: postsPageRoute(sanitizedPageNumber),
    description,
    pageNumber: sanitizedPageNumber,
    title,
  });
}

export async function generateStaticParams() {
  "use cache";

  cacheTag("posts");
  cacheLife("static");

  const { totalDocs } = await getPostCount();

  return ensureStaticParams(
    getPaginatedStaticParams(totalDocs, POSTS_PER_PAGE).map((pageNumber) => ({
      pageNumber,
    })),
    { pageNumber: "__placeholder__" }
  );
}
