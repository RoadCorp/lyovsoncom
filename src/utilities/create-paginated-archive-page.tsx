import type { Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import type { PaginatedDocs } from "payload";
import type { ReactNode } from "react";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import { getPaginatedStaticParams } from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import {
  getActivityCount,
  getLatestActivities,
} from "@/utilities/get-activity";
import { getNoteCount } from "@/utilities/get-note";
import { getPostCount } from "@/utilities/get-post";
import {
  type BuildPaginatedArchiveMetadataArgs,
  buildPaginatedArchiveMetadata,
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import { absoluteUrl } from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

export type ArchiveCollection = "activities" | "notes" | "posts";

const ARCHIVE_COUNTS: Record<
  ArchiveCollection,
  () => Promise<{ totalDocs: number }>
> = {
  activities: getActivityCount,
  notes: getNoteCount,
  posts: getPostCount,
};

interface PaginatedArchivePageArgs {
  params: Promise<{
    pageNumber: string;
  }>;
}

interface PaginatedArchivePageConfig<TDoc, TIndex extends string> {
  /** Collection whose count drives static params; also the cache tag. */
  collection: ArchiveCollection;
  copy: {
    /** Visually hidden heading, followed by " - Page N". */
    heading: string;
    metaDescription: (pageNumber: number) => string;
    metaTitle: (pageNumber: number) => string;
    schemaDescription: (pageNumber: number) => string;
    /** JSON-LD name, followed by " - Page N". */
    schemaName: string;
  };
  /** Tags the static params with these before the collection tag. */
  extraCacheTags?: string[];
  getItemUrl: (doc: TDoc) => string | null;
  getPage: (pageNumber: number, limit: number) => Promise<PaginatedDocs<TDoc>>;
  perPage: number;
  renderItems: (docs: TDoc[]) => ReactNode;
  routes: {
    index: () => Route<TIndex>;
    page: (pageNumber: number) => string;
  };
  /** Social image and keywords for the page metadata. */
  seo?: Pick<BuildPaginatedArchiveMetadataArgs, "image" | "keywords">;
  /** Adds the latest activities rail after the items, as on the home page. */
  withActivitiesPreview?: boolean;
}

async function getArchiveStaticParams(
  collection: ArchiveCollection,
  perPage: number,
  extraCacheTags: string[]
) {
  "use cache";

  for (const tag of extraCacheTags) {
    cacheTag(tag);
  }
  cacheTag(collection);
  cacheLife("static");

  const { totalDocs } = await ARCHIVE_COUNTS[collection]();

  return ensureStaticParams(
    getPaginatedStaticParams(totalDocs, perPage).map((pageNumber) => ({
      pageNumber,
    })),
    { pageNumber: "__placeholder__" }
  );
}

/**
 * Builds `/<collection>/page/[pageNumber]` for the public archives. Route
 * segment config such as `prefetch` must stay a literal export in each page.
 */
export function createPaginatedArchivePage<TDoc, TIndex extends string>({
  collection,
  copy,
  extraCacheTags = [],
  getItemUrl,
  getPage,
  perPage,
  renderItems,
  routes,
  seo,
  withActivitiesPreview = false,
}: PaginatedArchivePageConfig<TDoc, TIndex>) {
  function generateStaticParams() {
    return getArchiveStaticParams(collection, perPage, extraCacheTags);
  }

  async function PageContent({
    params: paramsPromise,
  }: PaginatedArchivePageArgs) {
    const { pageNumber } = await paramsPromise;
    const pageState = getPaginatedArchivePageState(pageNumber);

    if (pageState.kind === "notFound") {
      notFound();
    }

    if (pageState.kind === "redirect") {
      redirect(routes.index());
    }

    const sanitizedPageNumber = pageState.pageNumber;
    const [response, activities] = await Promise.all([
      getPage(sanitizedPageNumber, perPage),
      withActivitiesPreview
        ? getLatestActivities(ACTIVITY_PREVIEW_LIMIT).then(
            (preview) => preview.docs
          )
        : null,
    ]);

    if (
      !response ||
      isPaginatedArchivePageOutOfRange(sanitizedPageNumber, response.totalPages)
    ) {
      return notFound();
    }

    const { docs, page, totalDocs, totalPages } = response;

    const collectionPageSchema = generateCollectionPageSchema({
      name: `${copy.schemaName} - Page ${sanitizedPageNumber}`,
      description: copy.schemaDescription(sanitizedPageNumber),
      url: absoluteUrl(routes.page(sanitizedPageNumber)),
      itemCount: totalDocs,
      items: docs.flatMap((doc) => {
        const url = getItemUrl(doc);
        return url ? [{ url }] : [];
      }),
    });

    const heading = (
      <h1 className="sr-only">
        {`${copy.heading} - Page `}
        {sanitizedPageNumber}
      </h1>
    );
    const jsonLd = <JsonLd data={collectionPageSchema} />;
    const items = renderItems(docs);
    const pagination =
      totalPages > 1 && page ? (
        <Pagination
          className={
            activities?.length
              ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
              : undefined
          }
          getPageHref={(pageNumberValue) => routes.page(pageNumberValue)}
          page={page}
          totalPages={totalPages}
        />
      ) : null;

    // Two literal trees keep the children identical to the original pages:
    // no empty slot where the preview rail would go.
    if (!activities) {
      return (
        <>
          {heading}
          {jsonLd}
          {items}
          {pagination}
        </>
      );
    }

    return (
      <>
        {heading}
        {jsonLd}
        {items}
        <GridCardActivitiesPreview
          activities={activities}
          className={HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
        />
        {pagination}
      </>
    );
  }

  async function generateMetadata({
    params: paramsPromise,
  }: PaginatedArchivePageArgs): Promise<Metadata> {
    const { pageNumber } = await paramsPromise;
    const pageState = getPaginatedArchivePageState(pageNumber);

    if (pageState.kind !== "page") {
      return buildNotFoundMetadata();
    }

    const sanitizedPageNumber = pageState.pageNumber;

    return buildPaginatedArchiveMetadata({
      canonicalPath: routes.page(sanitizedPageNumber),
      description: copy.metaDescription(sanitizedPageNumber),
      pageNumber: sanitizedPageNumber,
      title: copy.metaTitle(sanitizedPageNumber),
      ...seo,
    });
  }

  function Page(props: PaginatedArchivePageArgs) {
    return (
      <PublicPageBoundary>
        <PageContent {...props} />
      </PublicPageBoundary>
    );
  }

  return { generateMetadata, generateStaticParams, Page };
}
