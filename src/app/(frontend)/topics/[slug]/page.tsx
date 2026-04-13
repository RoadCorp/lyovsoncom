import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getAllTopics, getTopic } from "@/utilities/get-topic";
import { getTopicPosts } from "@/utilities/get-topic-posts";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  homeRoute,
  postUrl,
  topicPageRoute,
  topicRoute,
} from "@/utilities/routes";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";

  cacheTag("topics");
  cacheLife("static");

  const topicsResponse = await getAllTopics();

  return ensureStaticParams(
    topicsResponse.docs.map(({ slug }) => ({
      slug,
    })),
    { slug: "__placeholder__" }
  );
}

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise;

  const topic = await getTopic(slug);
  if (!topic) {
    return notFound();
  }

  const response = await getTopicPosts(slug);
  if (!response) {
    return notFound();
  }

  const topicName = topic.name || slug;
  const { docs: posts, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: topicName,
    description: topic.description || `Posts about ${topicName}`,
    url: absoluteUrl(topicRoute(slug)),
    itemCount: totalDocs,
    items: posts
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: topicName, url: absoluteUrl(topicRoute(slug)) },
  ]);

  return (
    <>
      <h1 className="sr-only">{topicName}</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <CollectionArchive posts={posts} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) => topicPageRoute(slug, pageNumber)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise;

  const topic = await getTopic(slug);

  if (!topic) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Topic Not Found | Lyóvson.com",
      description: "The requested topic could not be found",
    };
  }

  const topicName = topic.name || slug;
  const description = topic.description || `Posts about ${topicName}`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `${topicName} | Lyóvson.com`,
    description,
    alternates: {
      canonical: topicRoute(slug),
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title: `${topicName} | Lyóvson.com`,
      description,
      type: "website",
      url: topicRoute(slug),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${topicName} | Lyóvson.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topicName} | Lyóvson.com`,
      description,
      creator: "@lyovson",
      site: "@lyovson",
      images: [
        {
          url: "/og-image.png",
          alt: `${topicName} | Lyóvson.com`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
