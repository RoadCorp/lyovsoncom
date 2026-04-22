import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  GridCardEmptyState,
  LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import {
  generateCollectionPageSchema,
  generatePersonSchema,
} from "@/utilities/generate-json-ld";
import { getLatestLyovsonActivities } from "@/utilities/get-activity";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import {
  getLyovsonDisplayName,
  getLyovsonPersonInput,
} from "@/utilities/lyovson-person";
import {
  absoluteUrl,
  lyovsonPageRoute,
  lyovsonRoute,
  postUrl,
} from "@/utilities/routes";
import { LyovsonFeedItems } from "./_components/lyovson-feed-items";
import { LYOVSON_ITEMS_PER_PAGE } from "./_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "./_utilities/metadata";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lyovson: username } = await params;

  const [response, activities] = await Promise.all([
    getLyovsonFeed({
      username,
      filter: "posts",
      page: 1,
      limit: LYOVSON_ITEMS_PER_PAGE,
    }),
    getLatestLyovsonActivities(username, ACTIVITY_PREVIEW_LIMIT),
  ]);

  if (!response) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;
  const hasActivitiesPreview = activities.length > 0;
  const displayName = getLyovsonDisplayName(user, username);
  const personInput = getLyovsonPersonInput(user);
  const personSchema = personInput ? generatePersonSchema(personInput) : null;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${displayName} - Posts`,
    description: `Published posts by ${displayName}.`,
    url: absoluteUrl(lyovsonRoute(username)),
    itemCount: totalItems,
    items: items
      .map((item) =>
        item.type === "post" && item.data.slug
          ? { url: postUrl(item.data.slug) }
          : null
      )
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">{displayName} posts</h1>
      <JsonLd
        data={
          personSchema
            ? [collectionPageSchema, personSchema]
            : collectionPageSchema
        }
      />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No published posts found for ${displayName} yet.`}
          title="No Posts Yet"
        />
      )}
      <GridCardActivitiesPreview
        activities={activities}
        className={LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
      />
      {totalPages > 1 ? (
        <Pagination
          className={
            hasActivitiesPreview
              ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
              : undefined
          }
          getPageHref={(pageNumber) => lyovsonPageRoute(username, pageNumber)}
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
    filter: "posts",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = getLyovsonDisplayName(response.user, username);
  const description = `Browse published posts by ${name}.`;

  return buildLyovsonMetadata({
    title: `${name} Posts`,
    description,
    canonicalPath: lyovsonRoute(username),
  });
}
