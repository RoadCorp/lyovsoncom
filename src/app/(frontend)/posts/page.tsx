import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestPosts } from "@/utilities/get-post";
import {
  absoluteUrl,
  postsPageRoute,
  postsRoute,
  postUrl,
} from "@/utilities/routes";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default async function Page() {
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
  ...buildSeoMetadata({
    title: "All Posts & Articles",
    description:
      "Browse all posts and articles from Lyóvson.com covering programming, design, philosophy, technology, and creative projects by Rafa and Jess Lyóvson.",
    canonicalPath: postsRoute(),
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
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "All Posts & Articles",
    },
    other: {
      "article:section": "Blog",
      "article:author": "Rafa Lyóvson, Jess Lyóvson",
    },
  }),
};
