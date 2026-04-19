import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestActivities } from "@/utilities/get-activity";
import { getLatestPosts } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  homepageRoute,
  homeRoute,
  postUrl,
} from "@/utilities/routes";

export default async function Page() {
  "use cache";

  cacheTag("homepage");
  cacheTag("posts");
  cacheLife("homepage");

  const [postResponse, activityResponse] = await Promise.all([
    getLatestPosts(POSTS_PER_PAGE),
    getLatestActivities(ACTIVITY_PREVIEW_LIMIT),
  ]);
  const { docs, totalDocs, totalPages } = postResponse;
  const hasActivitiesPreview = activityResponse.docs.length > 0;

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Latest Posts",
    description:
      "Latest posts and articles from Lyovson.com covering programming, design, philosophy, technology, and creative projects.",
    url: absoluteUrl(homeRoute()),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  return (
    <>
      <h1 className="sr-only">Lyóvson.com - Latest Posts</h1>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={docs} />
      <GridCardActivitiesPreview
        activities={activityResponse.docs}
        className={HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
      />
      {totalPages > 1 ? (
        <Pagination
          className={
            hasActivitiesPreview
              ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
              : undefined
          }
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
  title: "Latest Posts | Lyóvson.com",
  description:
    "Latest posts and articles from Lyóvson.com covering programming, design, philosophy, technology, and creative projects by Rafa and Jess Lyóvson.",
  keywords: [
    "latest posts",
    "articles",
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
    title: "Latest Posts | Lyóvson.com",
    description:
      "Latest posts and articles from Lyóvson.com covering programming, design, philosophy, technology, and creative projects.",
    type: "website",
    url: homeRoute(),
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Latest Posts | Lyóvson.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Posts | Lyóvson.com",
    description:
      "Latest posts and articles from Lyóvson.com covering programming, design, philosophy, and technology.",
    creator: "@lyovson",
    site: "@lyovson",
    images: [
      {
        url: "/og-image.png",
        alt: "Latest Posts | Lyóvson.com",
        width: 1200,
        height: 630,
      },
    ],
  },
};
