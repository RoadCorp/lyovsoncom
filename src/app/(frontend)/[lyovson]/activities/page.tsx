import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardActivityLedger, GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonActivityTypeCounts } from "@/utilities/get-activity";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  activityUrl,
  lyovsonActivitiesPageRoute,
  lyovsonActivitiesRoute,
  lyovsonActivitiesTypeRoute,
} from "@/utilities/routes";
import { LyovsonFeedItems } from "../_components/lyovson-feed-items";
import { LYOVSON_ITEMS_PER_PAGE } from "../_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";

export const prefetch = "partial";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

async function PageContent({ params }: PageProps) {
  const { lyovson: username } = await params;

  const [response, counts] = await Promise.all([
    getLyovsonFeed({
      username,
      filter: "activities",
      page: 1,
      limit: LYOVSON_ITEMS_PER_PAGE,
    }),
    getLyovsonActivityTypeCounts(username),
  ]);

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
      {counts ? (
        <GridCardActivityLedger
          baseHref={lyovsonActivitiesRoute(username)}
          counts={counts}
          getTypeHref={(type) => lyovsonActivitiesTypeRoute(username, type)}
        />
      ) : null}
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

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
