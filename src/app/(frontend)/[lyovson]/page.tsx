import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
import { getMixedFeedItemUrl } from "@/utilities/mixed-feed";
import {
  absoluteUrl,
  lyovsonPageRoute,
  lyovsonRoute,
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

  const response = await getLyovsonFeed({
    username,
    filter: "all",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts, Notes, and Activities`,
    description:
      user.quote ||
      `Chronological feed of recent posts, notes, and activities by ${user.name}.`,
    url: absoluteUrl(lyovsonRoute(username)),
    itemCount: totalItems,
    items: items
      .map((item) => {
        const url = getMixedFeedItemUrl(item);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">{user.name} feed</h1>
      <JsonLd data={collectionPageSchema} />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No published posts, notes, or activities found for ${user.name} yet.`}
          title="Nothing Published Yet"
        />
      )}
      {totalPages > 1 ? (
        <Pagination
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
    filter: "all",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const description =
    response.user.quote ||
    `Latest posts, notes, and activities by ${name}. Explore their work and updates.`;

  return buildLyovsonMetadata({
    title: `${name} Feed`,
    description,
    canonicalPath: lyovsonRoute(username),
  });
}
