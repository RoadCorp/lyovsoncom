import type { Metadata } from "next/types";
import { Suspense } from "react";
import { ArchiveItems } from "@/components/ArchiveItems";
import { CollectionArchive } from "@/components/CollectionArchive";
import { SkeletonCard } from "@/components/grid";
import {
  hydrateSearchResults,
  runHybridSearch,
  SearchInputError,
} from "@/search/service";
import { getServerSideURL } from "@/utilities/getURL";

const SEARCH_RESULTS_LIMIT = 12;

interface Args {
  searchParams: Promise<{
    q: string;
  }>;
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

  const headingText = query?.trim()
    ? `Search Results for "${query.trim()}"`
    : "Search";

  // If no query, return empty results
  if (!query?.trim()) {
    return (
      <>
        <h1 className="sr-only">{headingText}</h1>
        <CollectionArchive posts={[]} />
      </>
    );
  }

  try {
    const searchResults = await runHybridSearch(
      query.trim(),
      SEARCH_RESULTS_LIMIT
    );

    if (!searchResults.results || searchResults.results.length === 0) {
      return (
        <>
          <h1 className="sr-only">{headingText}</h1>
          <CollectionArchive posts={[]} />
        </>
      );
    }

    const sortedItems = await hydrateSearchResults(searchResults.results);

    return (
      <>
        <h1 className="sr-only">{headingText}</h1>
        <ArchiveItems items={sortedItems} />
      </>
    );
  } catch (_error) {
    if (!(_error instanceof SearchInputError)) {
      return (
        <>
          <h1 className="sr-only">{headingText}</h1>
          <CollectionArchive posts={[]} />
        </>
      );
    }

    return (
      <>
        <h1 className="sr-only">{headingText}</h1>
        <CollectionArchive posts={[]} />
      </>
    );
  }
}

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: Args): Promise<Metadata> {
  const { q: query } = await searchParamsPromise;

  const title = query
    ? `Search results for "${query}" | Lyóvson.com`
    : "Search | Lyóvson.com";

  const description = query
    ? `Find posts, articles, and content related to "${query}" on Lyóvson.com`
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
      index: !query, // Don't index search result pages, only the main search page
      follow: true,
    },
  };
}
