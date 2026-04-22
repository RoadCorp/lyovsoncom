import type { Metadata } from "next/types";
import { Suspense } from "react";
import { SkeletonCard } from "@/components/grid";
import { SearchPageContent } from "@/search/page-content";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

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

  return <SearchPageContent query={query} />;
}

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: Args): Promise<Metadata> {
  const { q: query } = await searchParamsPromise;
  const normalizedQuery = query?.trim() || "";

  const title = normalizedQuery
    ? `Search results for "${normalizedQuery}"`
    : "Search";

  const description = normalizedQuery
    ? `Find posts, articles, and content related to "${normalizedQuery}" on Lyóvson.com`
    : "Search for posts, articles, and content on Lyóvson.com";

  return buildSeoMetadata({
    title,
    description,
    canonicalPath: "/search",
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: title,
    },
    robots: {
      index: !normalizedQuery,
      follow: true,
    },
  });
}
