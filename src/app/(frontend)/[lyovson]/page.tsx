import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonFeed } from "@/utilities/get-lyovson-feed";
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

  const response = await getLyovsonFeed({
    username,
    filter: "posts",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return notFound();
  }

  const { items, totalItems, totalPages, user } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Posts`,
    description: `Published posts by ${user.name}.`,
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
      <h1 className="sr-only">{user.name} posts</h1>
      <JsonLd data={collectionPageSchema} />
      {items.length > 0 ? (
        <LyovsonFeedItems items={items} />
      ) : (
        <GridCardEmptyState
          description={`No published posts found for ${user.name} yet.`}
          title="No Posts Yet"
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
    filter: "posts",
    page: 1,
    limit: LYOVSON_ITEMS_PER_PAGE,
  });

  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const description = `Browse published posts by ${name}.`;

  return buildLyovsonMetadata({
    title: `${name} Posts`,
    description,
    canonicalPath: lyovsonRoute(username),
  });
}
