import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { GridCardEmptyState, GridCardPostLedger } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getPostsByType, getPostTypeCounts } from "@/utilities/get-post";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
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
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    type: string;
  }>;
}

async function PostTypePageContent({ params: paramsPromise }: Args) {
  const { type } = await paramsPromise;
  if (!isPostFilterType(type)) {
    return notFound();
  }

  const [response, counts] = await Promise.all([
    getPostsByType(type, 1, POSTS_PER_PAGE),
    getPostTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  const label = POST_TYPE_LABELS[type];
  const description = `${label} published by Rafa and Jess Lyóvson.`;

  const collectionPageSchema = generateCollectionPageSchema({
    name: label,
    description,
    url: absoluteUrl(postsTypeRoute(type)),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Posts", url: absoluteUrl(postsRoute()) },
    { name: label },
  ]);

  return (
    <>
      <h1 className="sr-only">{label}</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardPostLedger activeType={type} counts={counts} />
      {docs.length > 0 ? (
        <CollectionArchive posts={docs} />
      ) : (
        <GridCardEmptyState
          description={`No ${label.toLowerCase()} have been published yet.`}
          title={`No ${label} Yet`}
        />
      )}
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) => postsTypePageRoute(type, pageNumber)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export function generateStaticParams() {
  return POST_FILTER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { type } = await paramsPromise;
  if (!isPostFilterType(type)) {
    return buildNotFoundMetadata({
      title: "Post Format Not Found",
      description: "The requested post category could not be found.",
    });
  }

  const label = POST_TYPE_LABELS[type];
  return buildSeoMetadata({
    title: label,
    description: `Browse ${label.toLowerCase()} published by Rafa and Jess Lyóvson.`,
    canonicalPath: postsTypeRoute(type),
    image: {
      url: buildDynamicOgImageUrl({
        eyebrow: "Posts",
        title: label,
        meta: "Rafa & Jess Lyóvson",
      }),
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      alt: label,
    },
  });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <PostTypePageContent {...props} />
    </PublicPageBoundary>
  );
}
