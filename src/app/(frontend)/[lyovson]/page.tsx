import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { GridCardEmptyState, SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { getActivityPath } from "@/utilities/activity-path";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import type { LyovsonMixedFeedItem } from "@/utilities/get-lyovson-feed";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import { getServerSideURL } from "@/utilities/getURL";
import { LyovsonFeedItems } from "./_components/lyovson-feed-items";
import { LYOVSON_ITEMS_PER_PAGE } from "./_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "./_utilities/metadata";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

function getLyovsonFeedItemUrl(item: LyovsonMixedFeedItem): string | null {
  if (item.type === "post" && item.data.slug) {
    return `${getServerSideURL()}/posts/${item.data.slug}`;
  }

  if (item.type === "note" && item.data.slug) {
    return `${getServerSideURL()}/notes/${item.data.slug}`;
  }

  if (item.type === "activity") {
    const activityPath = getActivityPath(item.data);
    if (activityPath) {
      return `${getServerSideURL()}${activityPath}`;
    }
  }

  return null;
}

export default async function Page({ params }: PageProps) {
  "use cache";

  const { lyovson: username } = await params;

  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheLife("feed");

  const response = await getLyovsonFeed({
    username,
    filter: "all",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return notFound();
  }

  const { user, items, totalItems, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts, Notes, and Activities`,
    description:
      user.quote ||
      `Chronological feed of recent posts, notes, and activities by ${user.name}.`,
    url: `${getServerSideURL()}/${username}`,
    itemCount: totalItems,
    items: items
      .map((item) => {
        const itemUrl = getLyovsonFeedItemUrl(item);
        return itemUrl ? { url: itemUrl } : null;
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <h1 className="sr-only">{user.name} feed</h1>

      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {items.length > 0 ? (
          <LyovsonFeedItems items={items} />
        ) : (
          <GridCardEmptyState
            description={`No published posts, notes, or activities found for ${user.name} yet.`}
            title="Nothing Published Yet"
          />
        )}
      </Suspense>

      {totalPages > 1 && (
        <Pagination
          basePath={`/${username}/page`}
          firstPagePath={`/${username}`}
          page={1}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  "use cache";

  const { lyovson: username } = await params;

  const response = await getLyovsonFeed({
    username,
    filter: "all",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const { user } = response;
  const name = user.name || username;
  const description =
    user.quote ||
    `Latest posts, notes, and activities by ${name}. Explore their work and updates.`;

  return buildLyovsonMetadata({
    title: `${name} Feed`,
    description,
    canonicalPath: `/${username}`,
  });
}
