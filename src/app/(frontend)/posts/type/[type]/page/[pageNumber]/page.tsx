import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { GridCardPostLedger } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  POSTS_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getPostsByType, getPostTypeCounts } from "@/utilities/get-post";
import {
  isPostFilterType,
  POST_FILTER_TYPES,
  POST_TYPE_LABELS,
} from "@/utilities/post-type";
import {
  absoluteUrl,
  homeRoute,
  postsRoute,
  postsTypePageRoute,
  postsTypeRoute,
  postUrl,
} from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    pageNumber: string;
    type: string;
  }>;
}

async function PostTypePaginatedContent({ params: paramsPromise }: Args) {
  const { pageNumber: rawPageNumber, type } = await paramsPromise;
  if (!isPostFilterType(type)) {
    return notFound();
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (pageNumber === null) {
    return notFound();
  }
  if (pageNumber === 1) {
    redirect(postsTypeRoute(type));
  }

  const [response, counts] = await Promise.all([
    getPostsByType(type, pageNumber, POSTS_PER_PAGE),
    getPostTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  if (docs.length === 0 || pageNumber > totalPages) {
    return notFound();
  }

  const label = POST_TYPE_LABELS[type];
  const description = `${label} published by Rafa and Jess Lyóvson — Page ${pageNumber}.`;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${label} — Page ${pageNumber}`,
    description,
    url: absoluteUrl(postsTypePageRoute(type, pageNumber)),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Posts", url: absoluteUrl(postsRoute()) },
    { name: label, url: absoluteUrl(postsTypeRoute(type)) },
    { name: `Page ${pageNumber}` },
  ]);

  return (
    <>
      <h1 className="sr-only">
        {label} — Page {pageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardPostLedger activeType={type} counts={counts} />
      <CollectionArchive posts={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(nextPage) => postsTypePageRoute(type, nextPage)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("posts");
  cacheLife("static");

  const counts = await getPostTypeCounts();
  const params = POST_FILTER_TYPES.flatMap((type) =>
    getPaginatedStaticParams(counts[type] ?? 0, POSTS_PER_PAGE).map(
      (pageNumber) => ({ pageNumber, type })
    )
  );

  return ensureStaticParams(params, {
    pageNumber: "__placeholder__",
    type: "article",
  });
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber: rawPageNumber, type } = await paramsPromise;
  const pageNumber = parsePageNumber(rawPageNumber);

  if (!(isPostFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested posts page could not be found.",
    });
  }

  const response = await getPostsByType(type, pageNumber, POSTS_PER_PAGE);
  if (response.docs.length === 0 || pageNumber > response.totalPages) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested posts page could not be found.",
    });
  }

  const label = POST_TYPE_LABELS[type];
  return buildSeoMetadata({
    title: `${label} - Page ${pageNumber}`,
    description: `Browse ${label.toLowerCase()} published by Rafa and Jess Lyóvson - Page ${pageNumber}.`,
    canonicalPath: postsTypePageRoute(type, pageNumber),
    prevPath: postsTypePageRoute(type, pageNumber - 1),
    nextPath:
      pageNumber < response.totalPages
        ? postsTypePageRoute(type, pageNumber + 1)
        : undefined,
    robots:
      pageNumber > MAX_INDEXED_PAGE
        ? { index: false, follow: true }
        : undefined,
  });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <PostTypePaginatedContent {...props} />
    </PublicPageBoundary>
  );
}
