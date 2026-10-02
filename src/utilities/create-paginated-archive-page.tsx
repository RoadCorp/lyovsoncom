import type { Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import type { PaginatedDocs } from "payload";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/PublicPageBoundary";
import { getPaginatedStaticParams } from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getActivityCount } from "@/utilities/get-activity";
import { getNoteCount } from "@/utilities/get-note";
import { getPostCount } from "@/utilities/get-post";
import {
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
  getItemUrl: (doc: TDoc) => string | null;
  getPage: (pageNumber: number, limit: number) => Promise<PaginatedDocs<TDoc>>;
  perPage: number;
  renderItems: (docs: TDoc[]) => ReactNode;
  routes: {
    index: () => Route<TIndex>;
    page: (pageNumber: number) => string;
  };
}

async function getArchiveStaticParams(
  collection: ArchiveCollection,
  perPage: number
) {
  "use cache";

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
  getItemUrl,
  getPage,
  perPage,
  renderItems,
  routes,
}: PaginatedArchivePageConfig<TDoc, TIndex>) {
  function generateStaticParams() {
    return getArchiveStaticParams(collection, perPage);
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
    const response = await getPage(sanitizedPageNumber, perPage);

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

    return (
      <>
        <h1 className="sr-only">
          {`${copy.heading} - Page `}
          {sanitizedPageNumber}
        </h1>
        <JsonLd data={collectionPageSchema} />
        {renderItems(docs)}
        {totalPages > 1 && page ? (
          <Pagination
            getPageHref={(pageNumberValue) => routes.page(pageNumberValue)}
            page={page}
            totalPages={totalPages}
          />
        ) : null}
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
