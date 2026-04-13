import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
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
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import {
  getActivityCount,
  getLatestActivities,
} from "@/utilities/get-activity";
import { getLatestNotes, getNoteCount } from "@/utilities/get-note";
import { getLatestPosts, getPostCount } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";

const HOMEPAGE_ITEMS_LIMIT = 25;
const HOMEPAGE_FETCH_BUFFER = 5;

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

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("homepage");
  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheLife("static");

  const [
    { totalDocs: postCount },
    { totalDocs: noteCount },
    { totalDocs: activityCount },
  ] = await Promise.all([getPostCount(), getNoteCount(), getActivityCount()]);

  const totalItems = postCount + noteCount + activityCount;
  const totalPages = Math.ceil(totalItems / HOMEPAGE_ITEMS_LIMIT);
  const pages: { pageNumber: string }[] = [];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    pages.push({ pageNumber: String(pageNumber) });
  }

  return ensureStaticParams(pages, { pageNumber: "1" });
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  cacheTag("homepage");
  cacheTag(`homepage-page-${pageNumber}`);
  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheLife("homepage");

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) {
    notFound();
  }
  if (sanitizedPageNumber === 1) {
    redirect("/");
  }

  const feedWindowSize = sanitizedPageNumber * HOMEPAGE_ITEMS_LIMIT;
  const mixedFeedFetchLimit = feedWindowSize + HOMEPAGE_FETCH_BUFFER;

  // Fetch enough items from each collection to build a sorted mixed feed
  const [posts, notes, activities] = await Promise.all([
    getLatestPosts(mixedFeedFetchLimit),
    getLatestNotes(mixedFeedFetchLimit),
    getLatestActivities(mixedFeedFetchLimit),
  ]);

  // Merge and sort by date
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

  // Calculate pagination for the mixed feed
  const totalItems = posts.totalDocs + notes.totalDocs + activities.totalDocs;
  const totalPages = Math.ceil(totalItems / HOMEPAGE_ITEMS_LIMIT);
  const startIndex = (sanitizedPageNumber - 1) * HOMEPAGE_ITEMS_LIMIT;
  const endIndex = startIndex + HOMEPAGE_ITEMS_LIMIT;

  // If requested page is beyond available pages, 404
  if (sanitizedPageNumber > totalPages || sanitizedPageNumber < 1) {
    notFound();
  }

  // Get the items for this page
  const pageItems = mixedItems.slice(startIndex, endIndex);
  const collectionPageSchema = generateCollectionPageSchema({
    name: `Latest Posts, Notes, and Activities - Page ${sanitizedPageNumber}`,
    description: `Chronological mixed-content archive page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/page/${sanitizedPageNumber}`,
    itemCount: totalItems,
    items: pageItems
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
        Lyóvson.com - Latest Posts, Notes & Activities - Page {pageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {pageItems.map((item, index) => {
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

      {totalPages > 1 && (
        <Pagination
          basePath="/page"
          firstPagePath="/"
          page={sanitizedPageNumber}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const pageNum = Number(pageNumber);

  cacheTag("homepage");
  cacheLife("static");

  const isFirstPage = pageNum === 1;
  const title = isFirstPage
    ? "Lyóvson.com"
    : `Lyóvson.com - Page ${pageNumber}`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
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
      canonical: isFirstPage ? "/" : `/page/${pageNumber}`,
      ...(pageNum > 1 && {
        prev: pageNum === 2 ? "/" : `/page/${pageNum - 1}`,
      }),
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title,
      description: "Official website of Rafa and Jess Lyóvson",
      type: "website",
      url: isFirstPage ? "/" : `/page/${pageNumber}`,
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
      title,
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
}
