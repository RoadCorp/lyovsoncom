import type { Metadata } from "next/types";
import { Suspense } from "react";
import { SkeletonCard } from "@/components/grid";
import { SearchPageContent } from "@/search/page-content";
import { getServerSideURL } from "@/utilities/getURL";

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
