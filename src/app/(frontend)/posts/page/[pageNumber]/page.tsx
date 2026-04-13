import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  POSTS_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getPaginatedPosts, getPostCount } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  postsPageRoute,
  postsRoute,
  postUrl,
} from "@/utilities/routes";

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(postsRoute());
  }

  const response = await getPaginatedPosts(sanitizedPageNumber, POSTS_PER_PAGE);

  if (!response) {
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
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  const title = `Posts Page ${sanitizedPageNumber} | Lyóvson.com`;
  const description = `Posts and articles from Lyovson.com - Page ${sanitizedPageNumber}. Continue browsing our content on programming, design, and technology.`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    alternates: {
      canonical: postsPageRoute(sanitizedPageNumber),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: postsPageRoute(sanitizedPageNumber),
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
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
