import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  activityUrl,
  lyovsonActivitiesPageRoute,
  lyovsonActivitiesRoute,
} from "@/utilities/routes";
import { LyovsonFeedItems } from "../_components/lyovson-feed-items";
import { LYOVSON_ITEMS_PER_PAGE } from "../_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lyovson: username } = await params;

  const response = await getLyovsonFeed({
    username,
    filter: "activities",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Activities`,
    description: `Activities associated with ${user.name}.`,
    url: absoluteUrl(lyovsonActivitiesRoute(username)),
    itemCount: totalItems,
    items: items
      .map((item) =>
        item.type === "activity"
          ? (() => {
              const url = activityUrl(item.data);
              return url ? { url } : null;
            })()
          : null
      )
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">{user.name} activities</h1>
      <JsonLd data={collectionPageSchema} />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No public activities found for ${user.name} yet.`}
          title="No Activities Yet"
        />
      )}
      {totalPages > 1 ? (
        <Pagination
          getPageHref={(pageNumber) =>
            lyovsonActivitiesPageRoute(username, pageNumber)
          }
          page={1}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username } = await params;

  const response = await getLyovsonFeed({
    username,
    filter: "activities",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;

  return buildLyovsonMetadata({
    title: `${name} Activities`,
    description: `Browse activities associated with ${name}.`,
    canonicalPath: lyovsonActivitiesRoute(username),
  });
}
