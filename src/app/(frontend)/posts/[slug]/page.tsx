import configPromise from "@payload-config";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { Suspense } from "react";
import {
  GridCard,
  GridCardHero,
  GridCardReferences,
  GridCardRelatedPosts,
  GridCardSection,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import RichText from "@/components/RichText";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Media, Post } from "@/payload-types";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utilities/generate-json-ld";
import { getPost } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";

// Lexical content node types
type LexicalContentNode =
  | string
  | {
      text?: string;
      children?: LexicalContentNode[];
      content?: LexicalContentNode;
    }
  | LexicalContentNode[];

// Helper function to extract text from rich content
function _extractTextFromContent(content: LexicalContentNode): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(_extractTextFromContent).join(" ");
  }

  if (typeof content === "object") {
    if (content.text) {
      return content.text;
    }
    if (content.children) {
      return _extractTextFromContent(content.children);
    }
    if (content.content) {
      return _extractTextFromContent(content.content);
    }
  }

  return "";
}

interface Args {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params: paramsPromise }: Args) {
  "use cache";

  const { slug } = await paramsPromise;

  // Add cache tags for this specific post
  cacheTag("posts");
  cacheTag(`post-${slug}`);
  cacheLife("posts");

  const post = await getPost(slug);
  if (!post?.content) {
    return notFound();
  }

  // Extract data for JSON-LD schemas
  const postImage =
    post.featuredImage && typeof post.featuredImage === "object"
      ? (post.featuredImage as Media)
      : null;
  const imageUrl = postImage?.url
    ? `${getServerSideURL()}${postImage.url}`
    : undefined;

  // Generate Article schema
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.description || undefined,
    slug,
    publishedAt: post.publishedAt || undefined,
    updatedAt: post.updatedAt || undefined,
    imageUrl,
    imageWidth: postImage?.width || undefined,
    imageHeight: postImage?.height || undefined,
    authors: post.populatedAuthors
      ?.filter((author) => author.name && author.username)
      .map((author) => ({
        name: author.name as string,
        username: author.username as string,
      })),
    keywords: post.topics
      ?.map((topic) => {
        if (typeof topic === "object" && topic !== null) {
          return topic.name || topic.slug || "";
        }
        return "";
      })
      .filter(Boolean),
  });

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getServerSideURL() },
    { name: "Posts", url: `${getServerSideURL()}/posts` },
    { name: post.title },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCardHero className={""} post={post} />
      <GridCard
        className={cn(
          "g2:col-start-2 g2:col-end-3 g2:row-auto g2:row-start-3",
          "g3:col-end-4 g3:row-start-2 g3:w-[var(--grid-card-2x1)]",
          "aspect-auto h-auto"
        )}
        interactive={false}
      >
        <GridCardSection className="col-span-3 row-span-3 p-6">
          <RichText
            className="glass-stagger-3 h-full"
            content={post.content}
            enableGutter={false}
            enableProse={true}
          />
        </GridCardSection>
      </GridCard>

      <aside
        className={cn(
          "col-start-1 col-end-2 row-start-6 row-end-7 grid auto-rows-max gap-4 self-start",
          "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5"
        )}
      >
        {post.references && post.references.length > 0 && (
          <Suspense
            fallback={
              <div className="glass-section glass-loading h-[var(--grid-card-1x1)] w-[var(--grid-card-1x1)] animate-pulse rounded-xl">
                <Skeleton className="glass-badge h-full w-full" />
              </div>
            }
          >
            <GridCardReferences references={post.references} />
          </Suspense>
        )}

        <Suspense
          fallback={
            <div className="glass-section glass-loading h-[var(--grid-card-1x1)] w-[var(--grid-card-1x1)] animate-pulse rounded-xl">
              <Skeleton className="glass-badge h-full w-full" />
            </div>
          }
        >
          <RecommendedPosts
            recommendedIds={post.recommended_post_ids as number[] | undefined}
          />
        </Suspense>
      </aside>
    </>
  );
}

async function RecommendedPosts({
  recommendedIds,
}: {
  recommendedIds?: number[];
}) {
  // Early return if no recommendations stored
  if (!recommendedIds || recommendedIds.length === 0) {
    return null;
  }

  // Fetch the recommended posts by their stored IDs
  // No caching needed - these are pre-computed and stored in DB
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: "posts",
    where: {
      id: {
        in: recommendedIds,
      },
    },
    depth: 1, // Include featuredImage, etc.
    limit: recommendedIds.length,
  });

  // Payload's type narrowing is overly conservative here; find() returns full documents
  const docs = posts.docs as unknown as Post[];

  if (docs.length === 0) {
    return null;
  }

  return <GridCardRelatedPosts posts={docs} />;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("posts");
  cacheLife("static"); // Build-time data doesn't change often

  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: "posts",
    select: {
      slug: true,
    },
    where: {
      _status: {
        equals: "published",
      },
    },
    limit: 1000,
  });

  return ensureStaticParams(
    posts.docs
      .filter((post) => post.slug)
      .map((post) => ({
        slug: post.slug,
      })),
    { slug: "__placeholder__" }
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Metadata generation requires many conditional fields for SEO/social media
export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  "use cache";

  const { slug } = await paramsPromise;

  // Add cache tags for metadata
  cacheTag("posts");
  cacheTag(`post-${slug}`);
  cacheLife("posts");

  const post = await getPost(slug);
  if (!post) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Not Found | Lyovson.com",
      description: "The requested post could not be found",
    };
  }

  // Use main fields with fallbacks to old meta fields during migration
  type PostWithLegacyMeta = typeof post & {
    meta?: { description?: string; image?: unknown };
  };

  const title = post.title;
  const description =
    post.description || (post as PostWithLegacyMeta).meta?.description || "";
  const postImage =
    post.featuredImage || (post as PostWithLegacyMeta).meta?.image;
  const metaImage: Media | null =
    postImage && typeof postImage === "object" ? (postImage as Media) : null;

  // Since metadataBase is set in layout, we can use the URL directly
  const imageUrl = metaImage?.url || null;

  const ogImageAlt = metaImage?.alt || title;

  // Fix the topic mapping
  const keywords = post.topics
    ?.map((topic) => {
      if (typeof topic === "object" && topic !== null) {
        return topic.name || topic.slug || "";
      }
      return "";
    })
    .filter(Boolean);

  // Relative URL path - metadataBase will be prepended automatically
  const canonicalUrl = `/posts/${slug}`;

  return {
    title: `${title} | Lyovson.com`,
    description,
    keywords: keywords?.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl, // Let metadataBase handle the domain
      siteName: "Lyovson.com",
      images: imageUrl
        ? [
            {
              url: imageUrl, // Relative URL since metadataBase is set
              width: 1200,
              height: 630,
              alt: ogImageAlt || "",
            },
          ]
        : undefined,
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors:
        post.populatedAuthors?.map((author) => `/${author.username}`) || [], // Make author URLs relative
    },
    twitter: {
      card: "summary_large_image",
      site: "@lyovson",
      creator: post.populatedAuthors?.[0]?.username
        ? `@${post.populatedAuthors[0].username}`
        : "@lyovson",
      title,
      description,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: ogImageAlt || "",
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
    other: {
      // Only include defined values to satisfy TypeScript
      ...(process.env.FACEBOOK_APP_ID
        ? { "fb:app_id": process.env.FACEBOOK_APP_ID }
        : {}),
      ...(post.populatedAuthors?.length
        ? {
            "article:author": post.populatedAuthors
              .map((author) => author.name)
              .join(", "),
          }
        : {}),
      ...(post.publishedAt
        ? { "article:published_time": post.publishedAt }
        : {}),
      ...(post.updatedAt ? { "article:modified_time": post.updatedAt } : {}),
      ...(post.project && typeof post.project === "object" && post.project.slug
        ? { "article:section": post.project.slug }
        : {}),
      ...(keywords?.length ? { "article:tag": keywords.join(", ") } : {}),
      // AI-specific meta tags for individual articles
      "ai-content-type": "article",
      "ai-content-license": "attribution-required",
      "ai-content-language": "en",
      "ai-api-url": `${getServerSideURL()}/api/posts/${post.id}`,
      "ai-embedding-url": `${getServerSideURL()}/api/embeddings/posts/${post.id}`,
      ...(post.project && typeof post.project === "object" && post.project.slug
        ? { "ai-project": post.project.slug }
        : {}),
      ...(keywords?.length ? { "ai-topics": keywords.join(",") } : {}),
      ...(post.populatedAuthors?.length
        ? {
            "ai-authors": post.populatedAuthors
              .map((author) => author.username || author.name)
              .join(","),
          }
        : {}),
    },
  };
}
