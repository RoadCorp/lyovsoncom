import type { Metadata } from "next/types";
import { Suspense } from "react";
import { ArchiveItems } from "@/components/ArchiveItems";
import { GridCardEmptyState, SkeletonCard } from "@/components/grid";
import {
  hydrateSearchResults,
  runHybridSearch,
  SearchInputError,
} from "@/search/service";
import { getServerSideURL } from "@/utilities/getURL";
import { getPayloadClient } from "@/utilities/payload-client";

const SEARCH_RESULTS_LIMIT = 12;
const SEARCH_FAILURE_STATUS = 500;

interface Args {
  searchParams: Promise<{
    q: string;
  }>;
}

interface SearchEmptyStateProps {
  description: string;
  heading: string;
  title: string;
}

function SearchEmptyState({
  description,
  heading,
  title,
}: SearchEmptyStateProps) {
  return (
    <>
      <h1 className="sr-only">{heading}</h1>
      <GridCardEmptyState description={description} title={title} />
    </>
  );
}

async function logSearchPageFailure(query: string, error: unknown) {
  try {
    const payload = await getPayloadClient();

    payload.logger.error({
      msg: "app.search.page.failed",
      query,
      queryLength: query.length,
      error: error instanceof Error ? error.message : String(error),
    });
  } catch {
    // Logging failures should never replace the original empty/error UI.
  }
}

export default function SuspendedSearchPage({
  searchParams: searchParamsPromise,
}: Args) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <SearchPage searchParams={searchParamsPromise} />
    </Suspense>
  );
}

async function SearchPage({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise;
  const normalizedQuery = query?.trim() || "";

  const headingText = normalizedQuery
    ? `Search Results for "${normalizedQuery}"`
    : "Search";

  if (!normalizedQuery) {
    return (
      <SearchEmptyState
        description="Use the search box to find posts, notes, and activities across Lyóvson.com."
        heading={headingText}
        title="Search the Site"
      />
    );
  }

  try {
    const searchResults = await runHybridSearch(
      normalizedQuery,
      SEARCH_RESULTS_LIMIT
    );

    if (!searchResults.results || searchResults.results.length === 0) {
      return (
        <SearchEmptyState
          description={`No posts, notes, or activities matched "${normalizedQuery}".`}
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    const sortedItems = await hydrateSearchResults(searchResults.results);

    if (sortedItems.length === 0) {
      return (
        <SearchEmptyState
          description={`No public results matched "${normalizedQuery}".`}
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    return (
      <>
        <h1 className="sr-only">{headingText}</h1>
        <ArchiveItems items={sortedItems} />
      </>
    );
  } catch (error) {
    if (
      error instanceof SearchInputError &&
      error.status < SEARCH_FAILURE_STATUS
    ) {
      return (
        <SearchEmptyState
          description={`No posts, notes, or activities matched "${normalizedQuery}".`}
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    await logSearchPageFailure(normalizedQuery, error);

    return (
      <SearchEmptyState
        description="Search is temporarily unavailable. Please try again in a moment."
        heading={headingText}
        title="Search Unavailable"
      />
    );
  }
}

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: Args): Promise<Metadata> {
  const { q: query } = await searchParamsPromise;
  const normalizedQuery = query?.trim() || "";

  const title = normalizedQuery
    ? `Search results for "${normalizedQuery}" | Lyóvson.com`
    : "Search | Lyóvson.com";

  const description = normalizedQuery
    ? `Find posts, articles, and content related to "${normalizedQuery}" on Lyóvson.com`
    : "Search for posts, articles, and content on Lyóvson.com";

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    alternates: {
      canonical: "/search",
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title,
      description,
      type: "website",
      url: "/search",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@lyovson",
      site: "@lyovson",
      images: [
        {
          url: "/og-image.png",
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    robots: {
      index: !normalizedQuery,
      follow: true,
    },
  };
}
