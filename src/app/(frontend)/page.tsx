import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import {
  GridCardActivityFull,
  GridCardNoteFull,
  GridCardPostFull,
  SkeletonGrid,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import type { Activity, Note, Post } from "@/payload-types";
import { getActivityPath } from "@/utilities/activity-path";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestActivities } from "@/utilities/get-activity";
import { getLatestNotes } from "@/utilities/get-note";
import { getLatestPosts } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";

const HOMEPAGE_ITEMS_LIMIT = 25;
const HOMEPAGE_FETCH_BUFFER = 5;
const HOMEPAGE_FETCH_LIMIT = HOMEPAGE_ITEMS_LIMIT + HOMEPAGE_FETCH_BUFFER;

type MixedFeedItem =
  | { type: "post"; data: Post; timestamp: number }
  | { type: "note"; data: Note; timestamp: number }
  | { type: "activity"; data: Activity; timestamp: number };

function getFeedTimestamp(item: {
  type: "post" | "note" | "activity";
  data: Post | Note | Activity;
}): number {
  let dateValue = "";

  if (item.type === "activity") {
    const activity = item.data as Activity;
    dateValue =
      activity.finishedAt || activity.startedAt || activity.publishedAt || "";
  } else if (item.type === "note") {
    const note = item.data as Note;
    dateValue = note.publishedAt || note.createdAt || "";
  } else {
    const post = item.data as Post;
    dateValue = post.publishedAt || post.createdAt || "";
  }

  return Date.parse(dateValue) || 0;
}

export default async function Page() {
  "use cache";
  cacheTag("homepage");
  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheLife("homepage");

  // Fetch a small buffer per collection to build the mixed homepage feed.
  const [posts, notes, activities] = await Promise.all([
    getLatestPosts(HOMEPAGE_FETCH_LIMIT),
    getLatestNotes(HOMEPAGE_FETCH_LIMIT),
    getLatestActivities(HOMEPAGE_FETCH_LIMIT),
  ]);

  const mixedItems: MixedFeedItem[] = [
    ...posts.docs.map((post) => ({
      type: "post" as const,
      data: post,
      timestamp: getFeedTimestamp({ type: "post", data: post }),
    })),
    ...notes.docs.map((note) => ({
      type: "note" as const,
      data: note,
      timestamp: getFeedTimestamp({ type: "note", data: note }),
    })),
    ...activities.docs.map((activity) => ({
      type: "activity" as const,
      data: activity,
      timestamp: getFeedTimestamp({ type: "activity", data: activity }),
    })),
  ];

  mixedItems.sort((a, b) => b.timestamp - a.timestamp);

  // Take only the latest 25 items
  const latestItems = mixedItems.slice(0, HOMEPAGE_ITEMS_LIMIT);

  // Use collection totals for accurate mixed-feed pagination without overfetching.
  const totalItems = posts.totalDocs + notes.totalDocs + activities.totalDocs;
  const totalPages = Math.ceil(totalItems / HOMEPAGE_ITEMS_LIMIT);
  const hasMore = totalPages > 1;
  const collectionPageSchema = generateCollectionPageSchema({
    name: "Latest Posts, Notes, and Activities",
    description:
      "Chronological feed of recent posts, notes, and activities from Lyovson.com.",
    url: getServerSideURL(),
    itemCount: totalItems,
    items: latestItems
      .map((item) => {
        if (item.type === "post" && item.data.slug) {
          return { url: `${getServerSideURL()}/posts/${item.data.slug}` };
        }
        if (item.type === "note" && item.data.slug) {
          return { url: `${getServerSideURL()}/notes/${item.data.slug}` };
        }
        if (item.type === "activity") {
          const path = getActivityPath(item.data);
          if (path) {
            return { url: `${getServerSideURL()}${path}` };
          }
        }
        return null;
      })
      .filter((item): item is { url: string } => Boolean(item)),
  });

  return (
    <>
      <h1 className="sr-only">
        Lyóvson.com - Latest Posts, Notes & Activities
      </h1>
      <JsonLd data={collectionPageSchema} />

      {/* <PWAInstall /> */}

      <Suspense fallback={<SkeletonGrid />}>
        {latestItems.map((item, index) => {
          if (item.type === "post") {
            return (
              <GridCardPostFull
                key={`post-${item.data.slug}`}
                post={item.data}
                {...(index === 0 && { priority: true })}
              />
            );
          }
          if (item.type === "note") {
            return (
              <GridCardNoteFull
                key={`note-${item.data.slug}`}
                note={item.data}
                {...(index === 0 && { priority: true })}
              />
            );
          }
          if (item.type === "activity") {
            return (
              <GridCardActivityFull
                activity={item.data}
                key={`activity-${item.data.id}`}
                {...(index === 0 && { priority: true })}
              />
            );
          }
          return null;
        })}
      </Suspense>

      {hasMore && (
        <Pagination
          basePath="/page"
          firstPagePath="/"
          page={1}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export function generateMetadata(): Metadata {
  return {
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
      canonical: "/",
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title: "Lyóvson.com",
      description: "Official website of Rafa and Jess Lyóvson",
      type: "website",
      url: "/",
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
    other: {
      "article:author": "Rafa Lyóvson, Jess Lyóvson",
      "application-name": "Lyóvson.com",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": "Lyóvson.com",
      "msapplication-TileColor": "#000000",
      "msapplication-config": "/browserconfig.xml",
      "theme-color": "#000000",
    },
  };
}
