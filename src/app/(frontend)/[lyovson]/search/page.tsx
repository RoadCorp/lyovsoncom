import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { SkeletonCard } from "@/components/grid";
import { SearchPageContent } from "@/search/page-content";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";
import { getLyovsonStaticParams } from "../_utilities/staticParams";

interface PageProps {
  params: Promise<{ lyovson: string }>;
  searchParams: Promise<{ q: string }>;
}

export async function generateStaticParams() {
  return getLyovsonStaticParams();
}

export default function SuspendedLyovsonSearchPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <LyovsonSearchPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function LyovsonSearchPage({ params, searchParams }: PageProps) {
  const [{ lyovson: username }, { q: query }] = await Promise.all([
    params,
    searchParams,
  ]);
  const profile = await getLyovsonProfile(username);

  if (!profile) {
    return notFound();
  }

  return (
    <SearchPageContent
      query={query}
      scopeLabel={profile.name || username}
      scopeUsername={username}
    />
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ lyovson: username }, { q: query }] = await Promise.all([
    params,
    searchParams,
  ]);
  const profile = await getLyovsonProfile(username);

  if (!profile) {
    return buildLyovsonNotFoundMetadata();
  }

  const normalizedQuery = query?.trim() || "";
  const scopeLabel = profile.name || username;

  return buildLyovsonMetadata({
    title: normalizedQuery
      ? `${scopeLabel} Search: "${normalizedQuery}"`
      : `${scopeLabel} Search`,
    description: normalizedQuery
      ? `Find posts, notes, and activities related to "${normalizedQuery}" for ${scopeLabel}.`
      : `Search posts, notes, and activities for ${scopeLabel}.`,
    canonicalPath: `/${username}/search`,
    robots: {
      index: !normalizedQuery,
      follow: true,
    },
  });
}
