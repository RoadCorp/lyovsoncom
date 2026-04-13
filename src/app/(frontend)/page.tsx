import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next/types";
import { ArchiveItems } from "@/components/ArchiveItems";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestActivities } from "@/utilities/get-activity";
import { getLatestNotes } from "@/utilities/get-note";
import { getLatestPosts } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";
import {
  getMixedFeedItemUrl,
  mapActivitiesToMixedFeedItems,
  mapNotesToMixedFeedItems,
  mapPostsToMixedFeedItems,
  sortMixedFeedItems,
} from "@/utilities/mixed-feed";
import { absoluteUrl, homepageRoute, homeRoute } from "@/utilities/routes";

const HOMEPAGE_ITEMS_LIMIT = 25;
const HOMEPAGE_FETCH_BUFFER = 5;
const HOMEPAGE_FETCH_LIMIT = HOMEPAGE_ITEMS_LIMIT + HOMEPAGE_FETCH_BUFFER;

export default async function Page() {
  "use cache";

  cacheTag("homepage");
  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheLife("homepage");

  const [posts, notes, activities] = await Promise.all([
    getLatestPosts(HOMEPAGE_FETCH_LIMIT),
    getLatestNotes(HOMEPAGE_FETCH_LIMIT),
    getLatestActivities(HOMEPAGE_FETCH_LIMIT),
  ]);

  const latestItems = sortMixedFeedItems([
    ...mapPostsToMixedFeedItems(posts.docs),
    ...mapNotesToMixedFeedItems(notes.docs),
    ...mapActivitiesToMixedFeedItems(activities.docs),
  ]).slice(0, HOMEPAGE_ITEMS_LIMIT);

  const totalItems = posts.totalDocs + notes.totalDocs + activities.totalDocs;
  const totalPages = Math.ceil(totalItems / HOMEPAGE_ITEMS_LIMIT);

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Latest Posts, Notes, and Activities",
    description:
      "Chronological feed of recent posts, notes, and activities from Lyovson.com.",
    url: absoluteUrl(homeRoute()),
    itemCount: totalItems,
    items: latestItems
      .map((item) => {
        const url = getMixedFeedItemUrl(item);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">
        Lyóvson.com - Latest Posts, Notes & Activities
      </h1>
      <JsonLd data={collectionPageSchema} />
      <ArchiveItems items={latestItems} />
      {totalPages > 1 ? (
        <Pagination
          getPageHref={(pageNumber) => homepageRoute(pageNumber)}
          page={1}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "Lyóvson.com",
  description: "Official website of Rafa and Jess Lyóvson",
  keywords: [
    "Rafa Lyóvson",
    "Jess Lyóvson",
    "programming",
    "writing",
    "design",
    "philosophy",
    "research",
    "projects",
    "technology",
    "blog",
  ],
  alternates: {
    canonical: homeRoute(),
  },
  openGraph: {
    siteName: "Lyóvson.com",
    title: "Lyóvson.com",
    description: "Official website of Rafa and Jess Lyóvson",
    type: "website",
    url: homeRoute(),
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lyóvson.com - Writing, Projects & Research",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lyóvson.com",
    description: "Official website of Rafa and Jess Lyóvson",
    creator: "@lyovson",
    site: "@lyovson",
    images: [
      {
        url: "/og-image.png",
        alt: "Lyóvson.com - Writing, Projects & Research",
        width: 1200,
        height: 630,
      },
    ],
  },
};
