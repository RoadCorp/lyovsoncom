import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  GridCardEmptyState,
  LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/PublicPageBoundary";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestLyovsonActivities } from "@/utilities/get-activity";
import {
  getLyovsonFeed,
  type LyovsonFilter,
  type LyovsonMixedFeedItem,
} from "@/utilities/get-lyovson-feed";
import { absoluteUrl } from "@/utilities/routes";
import { LyovsonFeedItems } from "../_components/lyovson-feed-items";
import {
  getValidPageNumber,
  LYOVSON_ITEMS_PER_PAGE,
  MAX_INDEXED_PAGE,
} from "./constants";
import { buildLyovsonMetadata, buildLyovsonNotFoundMetadata } from "./metadata";
import { getLyovsonPaginatedStaticParams } from "./staticParams";

interface LyovsonFeedPageArgs {
  params: Promise<{
    lyovson: string;
    pageNumber: string;
  }>;
}

interface LyovsonFeedPageConfig<TIndex extends string> {
  /** Describes the page for JSON-LD and metadata, e.g. "Public notes by X on page 2." */
  describe: (name: string, pageNumber: number) => string;
  filter: Exclude<LyovsonFilter, "all">;
  getItemUrl: (item: LyovsonMixedFeedItem) => string | null;
  /** Capitalised plural, e.g. "Notes"; lowercased in the heading and empty state. */
  label: string;
  routes: {
    index: (username: string) => Route<TIndex>;
    page: (username: string, pageNumber: number) => string;
  };
  /** Adds the latest activities rail beside the feed. */
  withActivitiesPreview?: boolean;
}

/**
 * Builds `/[lyovson]/…/page/[pageNumber]` for a person's feeds. Route segment
 * config such as `prefetch` must stay a literal export in each page.
 */
export function createLyovsonFeedPage<TIndex extends string>({
  describe,
  filter,
  getItemUrl,
  label,
  routes,
  withActivitiesPreview = false,
}: LyovsonFeedPageConfig<TIndex>) {
  const noun = label.toLowerCase();

  function generateStaticParams() {
    return getLyovsonPaginatedStaticParams(filter);
  }

  async function PageContent({ params: paramsPromise }: LyovsonFeedPageArgs) {
    const { lyovson: username, pageNumber } = await paramsPromise;
    const sanitizedPageNumber = getValidPageNumber(pageNumber);

    if (sanitizedPageNumber == null) {
      notFound();
    }

    if (sanitizedPageNumber === 1) {
      redirect(routes.index(username));
    }

    const [response, activities] = await Promise.all([
      getLyovsonFeed({
        username,
        filter,
        page: sanitizedPageNumber,
        limit: LYOVSON_ITEMS_PER_PAGE,
      }),
      withActivitiesPreview
        ? getLatestLyovsonActivities(username, ACTIVITY_PREVIEW_LIMIT)
        : null,
    ]);

    if (!response || sanitizedPageNumber > response.totalPages) {
      return notFound();
    }

    const { items, totalItems, totalPages, user } = response;

    const collectionPageSchema = generateCollectionPageSchema({
      name: `${user.name} - ${label} Page ${sanitizedPageNumber}`,
      description: describe(user.name, sanitizedPageNumber),
      url: absoluteUrl(routes.page(username, sanitizedPageNumber)),
      itemCount: totalItems,
      items: items.flatMap((item) => {
        const url = getItemUrl(item);
        return url ? [{ url }] : [];
      }),
    });

    const heading = (
      <h1 className="sr-only">
        {user.name}
        {` ${noun} page `}
        {sanitizedPageNumber}
      </h1>
    );
    const jsonLd = <JsonLd data={collectionPageSchema} />;
    const feed =
      items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No ${noun} found on page ${sanitizedPageNumber} for ${user.name}.`}
          title="No Results"
        />
      );
    const getPageHref = (pageNumberValue: number) =>
      routes.page(username, pageNumberValue);

    // Two literal trees keep the children identical to the original pages:
    // no empty slot where the preview rail would go.
    if (!activities) {
      return (
        <>
          {heading}
          {jsonLd}
          {feed}
          <Pagination
            getPageHref={getPageHref}
            page={sanitizedPageNumber}
            totalPages={totalPages}
          />
        </>
      );
    }

    return (
      <>
        {heading}
        {jsonLd}
        {feed}
        <GridCardActivitiesPreview
          activities={activities}
          className={LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
        />
        <Pagination
          className={
            activities.length > 0
              ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
              : undefined
          }
          getPageHref={getPageHref}
          page={sanitizedPageNumber}
          totalPages={totalPages}
        />
      </>
    );
  }

  async function generateMetadata({
    params: paramsPromise,
  }: LyovsonFeedPageArgs): Promise<Metadata> {
    const { lyovson: username, pageNumber } = await paramsPromise;
    const sanitizedPageNumber = getValidPageNumber(pageNumber);

    if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
      return buildLyovsonNotFoundMetadata();
    }

    const response = await getLyovsonFeed({
      username,
      filter,
      page: sanitizedPageNumber,
      limit: LYOVSON_ITEMS_PER_PAGE,
    });

    if (!response || sanitizedPageNumber > response.totalPages) {
      return buildLyovsonNotFoundMetadata();
    }

    const name = response.user.name || username;

    return buildLyovsonMetadata({
      title: `${name} ${label} - Page ${sanitizedPageNumber}`,
      description: describe(name, sanitizedPageNumber),
      canonicalPath: routes.page(username, sanitizedPageNumber),
      prevPath:
        sanitizedPageNumber === 2
          ? routes.index(username)
          : routes.page(username, sanitizedPageNumber - 1),
      nextPath:
        sanitizedPageNumber < response.totalPages
          ? routes.page(username, sanitizedPageNumber + 1)
          : undefined,
      robots: {
        index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
        follow: true,
        noarchive: true,
      },
    });
  }

  function Page(props: LyovsonFeedPageArgs) {
    return (
      <PublicPageBoundary>
        <PageContent {...props} />
      </PublicPageBoundary>
    );
  }

  return { generateMetadata, generateStaticParams, Page };
}
