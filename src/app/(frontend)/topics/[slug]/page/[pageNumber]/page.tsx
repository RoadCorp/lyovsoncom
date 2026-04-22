import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import {
  getPaginatedStaticParams,
  parsePageNumber,
  TOPIC_POSTS_PER_PAGE,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getAllTopics, getTopic } from "@/utilities/get-topic";
import {
  getPaginatedTopicPosts,
  getTopicPostCount,
} from "@/utilities/get-topic-posts";
import { buildPaginatedArchiveMetadata } from "@/utilities/paginated-archive";
import {
  absoluteUrl,
  postRoute,
  topicPageRoute,
  topicRoute,
} from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

interface Args {
  params: Promise<{
    pageNumber: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("topics");
  cacheLife("static");

  const topicsResponse = await getAllTopics();
  const paths: { pageNumber: string; slug: string }[] = [];
  let fallbackSlug: string | null = null;

  for (const { slug } of topicsResponse.docs) {
    if (!slug) {
      continue;
    }

    fallbackSlug ??= slug;

    const totalPosts = await getTopicPostCount(slug);
    for (const pageNumber of getPaginatedStaticParams(
      totalPosts ?? 0,
      TOPIC_POSTS_PER_PAGE
    )) {
      paths.push({
        slug,
        pageNumber,
      });
    }
  }

  return ensureStaticParams(paths, {
    slug: fallbackSlug || "__placeholder__",
    pageNumber: "__placeholder__",
  });
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    return notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(topicRoute(slug));
  }

  const topic = await getTopic(slug);
  if (!topic) {
    return notFound();
  }

  const response = await getPaginatedTopicPosts(
    slug,
    sanitizedPageNumber,
    TOPIC_POSTS_PER_PAGE
  );

  if (!response) {
    return notFound();
  }

  const { docs: posts, page, totalPages } = response;
  const topicName = topic.name || slug;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${topicName} - Page ${sanitizedPageNumber}`,
    description:
      topic.description ||
      `Archive of posts about ${topicName} on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(topicPageRoute(slug, sanitizedPageNumber)),
    itemCount: response.totalDocs,
    items: posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: absoluteUrl(postRoute(post.slug as string)),
      })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={posts} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumberValue) =>
            topicPageRoute(slug, pageNumberValue)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return buildNotFoundMetadata();
  }

  const topic = await getTopic(slug);
  if (!topic) {
    return buildNotFoundMetadata({
      title: "Topic Not Found",
      description: "The requested topic could not be found",
    });
  }

  const topicName = topic.name || slug;
  const description =
    topic.description ||
    `Posts about ${topicName} - page ${sanitizedPageNumber}`;
  const title = `${topicName} - Page ${sanitizedPageNumber}`;

  return buildPaginatedArchiveMetadata({
    canonicalPath: topicPageRoute(slug, sanitizedPageNumber),
    description,
    pageNumber: sanitizedPageNumber,
    title,
  });
}
