import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { ArchiveItems } from "@/components/ArchiveItems";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import {
  getActivityCount,
  getLatestActivities,
} from "@/utilities/get-activity";
import { getLatestNotes, getNoteCount } from "@/utilities/get-note";
import { getLatestPosts, getPostCount } from "@/utilities/get-post";
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

  return ensureStaticParams(
    getPaginatedStaticParams(
      postCount + noteCount + activityCount,
      HOMEPAGE_ITEMS_LIMIT
    ).map((pageNumber) => ({ pageNumber })),
    { pageNumber: "__placeholder__" }
  );
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(homeRoute());
  }

  const mixedFeedFetchLimit =
    sanitizedPageNumber * HOMEPAGE_ITEMS_LIMIT + HOMEPAGE_FETCH_BUFFER;

  const [posts, notes, activities] = await Promise.all([
    getLatestPosts(mixedFeedFetchLimit),
    getLatestNotes(mixedFeedFetchLimit),
    getLatestActivities(mixedFeedFetchLimit),
  ]);

  const totalItems = posts.totalDocs + notes.totalDocs + activities.totalDocs;
  const totalPages = Math.ceil(totalItems / HOMEPAGE_ITEMS_LIMIT);

  if (sanitizedPageNumber > totalPages) {
    notFound();
  }

  const pageItems = sortMixedFeedItems([
    ...mapPostsToMixedFeedItems(posts.docs),
    ...mapNotesToMixedFeedItems(notes.docs),
    ...mapActivitiesToMixedFeedItems(activities.docs),
  ]).slice(
    (sanitizedPageNumber - 1) * HOMEPAGE_ITEMS_LIMIT,
    sanitizedPageNumber * HOMEPAGE_ITEMS_LIMIT
  );

  const collectionPageSchema = generateCollectionPageSchema({
    name: `Latest Posts, Notes, and Activities - Page ${sanitizedPageNumber}`,
    description: `Chronological mixed-content archive page ${sanitizedPageNumber}.`,
    url: absoluteUrl(homepageRoute(sanitizedPageNumber)),
    itemCount: totalItems,
    items: pageItems
      .map((item) => {
        const url = getMixedFeedItemUrl(item);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  return (
    <>
      <h1 className="sr-only">
        Lyóvson.com - Latest Posts, Notes & Activities - Page{" "}
        {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      <ArchiveItems items={pageItems} />
      <Pagination
        getPageHref={(pageNumberValue) => homepageRoute(pageNumberValue)}
        page={sanitizedPageNumber}
        totalPages={totalPages}
      />
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  const title = `Lyóvson.com - Page ${sanitizedPageNumber}`;

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
      canonical: homepageRoute(sanitizedPageNumber),
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title,
      description: "Official website of Rafa and Jess Lyóvson",
      type: "website",
      url: homepageRoute(sanitizedPageNumber),
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
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
