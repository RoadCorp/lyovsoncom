import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestPosts } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  postsPageRoute,
  postsRoute,
  postUrl,
} from "@/utilities/routes";

export default async function Page() {
  "use cache";

  cacheTag("posts");
  cacheTag("posts-page");
  cacheLife("posts");

  const response = await getLatestPosts(POSTS_PER_PAGE);

  if (!response) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Posts & Articles",
    description:
      "Browse all posts and articles covering programming, design, philosophy, technology, and creative projects.",
    url: absoluteUrl(postsRoute()),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  return (
    <>
      <h1 className="sr-only">All Posts & Articles</h1>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) => postsPageRoute(pageNumber)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "All Posts & Articles | Lyóvson.com",
  description:
    "Browse all posts and articles from Lyóvson.com covering programming, design, philosophy, technology, and creative projects by Rafa and Jess Lyóvson.",
  keywords: [
    "blog posts",
    "articles",
    "programming",
    "design",
    "philosophy",
    "technology",
    "Rafa Lyovson",
    "Jess Lyovson",
  ],
  alternates: {
    canonical: postsRoute(),
  },
  openGraph: {
    siteName: "Lyóvson.com",
    title: "All Posts & Articles - Lyóvson.com",
    description:
      "Browse all posts and articles covering programming, design, philosophy, technology, and creative projects.",
    type: "website",
    url: postsRoute(),
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "All Posts & Articles - Lyóvson.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Posts & Articles - Lyóvson.com",
    description:
      "Browse all posts and articles covering programming, design, philosophy, and technology.",
    creator: "@lyovson",
    site: "@lyovson",
    images: [
      {
        url: "/og-image.png",
        alt: "All Posts & Articles - Lyóvson.com",
        width: 1200,
        height: 630,
      },
    ],
  },
  other: {
    "article:section": "Blog",
    "article:author": "Rafa Lyóvson, Jess Lyóvson",
  },
};
