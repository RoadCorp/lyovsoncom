import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  GridCard,
  GridCardHero,
  GridCardReferences,
  GridCardRelatedPosts,
  GridCardSection,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { OptionalErrorBoundary } from "@/components/OptionalErrorBoundary";
import { PostTransitionBoundary } from "@/components/post-transitions/PostTransitionBoundary";
import RichText from "@/components/RichText";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Lyovson, Media, Post } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utilities/generate-json-ld";
import { getPost } from "@/utilities/get-post";
import { getLyovsonPersonInput } from "@/utilities/lyovson-person";
import { getPayloadClient } from "@/utilities/payload-client";
import { absoluteUrl, postRoute, postsRoute } from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

interface Args {
  params: Promise<{
    slug: string;
  }>;
}

type PostWithLegacyMeta = Post & {
  meta?: { description?: string; image?: unknown };
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: Media | number | null;
  };
};

function getPostKeywords(post: Post) {
  return post.topics
    ?.map((topic) => {
      if (typeof topic === "object" && topic !== null) {
        return topic.name || topic.slug || "";
      }

      return "";
    })
    .filter(Boolean);
}

function getPostMetaImage(post: PostWithLegacyMeta) {
  const postImage = post.seo?.image || post.featuredImage || post.meta?.image;
  return postImage && typeof postImage === "object"
    ? (postImage as Media)
    : null;
}

function getPostSectionSlug(post: Post) {
  return post.project && typeof post.project === "object" && post.project.slug
    ? post.project.slug
    : null;
}

function getPostTwitterCreator(post: Post) {
  return post.populatedAuthors?.[0]?.username
    ? `@${post.populatedAuthors[0].username}`
    : "@lyovson";
}

function getPostOtherMetadata(post: Post, keywords: string[] | undefined) {
  const projectSlug = getPostSectionSlug(post);
  const aiAuthors = post.populatedAuthors?.length
    ? post.populatedAuthors
        .map((author) => author.username || author.name)
        .join(",")
    : null;

  return {
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
    ...(post.publishedAt ? { "article:published_time": post.publishedAt } : {}),
    ...(post.updatedAt ? { "article:modified_time": post.updatedAt } : {}),
    ...(projectSlug ? { "article:section": projectSlug } : {}),
    ...(keywords?.length ? { "article:tag": keywords.join(", ") } : {}),
    "ai-content-type": "article",
    "ai-content-license": "attribution-required",
    "ai-content-language": "en",
    "ai-api-url": absoluteUrl(`/api/posts/${post.id}`),
    "ai-embedding-url": absoluteUrl(`/api/embeddings/posts/${post.id}`),
    ...(projectSlug ? { "ai-project": projectSlug } : {}),
    ...(keywords?.length ? { "ai-topics": keywords.join(",") } : {}),
    ...(aiAuthors ? { "ai-authors": aiAuthors } : {}),
  };
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise;

  const post = await getPost(slug);
  if (!post?.content) {
    return notFound();
  }

  const postImage =
    post.featuredImage && typeof post.featuredImage === "object"
      ? (post.featuredImage as Media)
      : null;
  const imageUrl = postImage?.url ? absoluteUrl(postImage.url) : undefined;

  const articleSchema = generateArticleSchema({
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.description || undefined,
    slug,
    publishedAt: post.publishedAt || undefined,
    updatedAt: post.updatedAt || undefined,
    imageUrl,
    imageWidth: postImage?.width || undefined,
    imageHeight: postImage?.height || undefined,
    authors:
      post.authors
        ?.map((author) =>
          typeof author === "object" && author !== null
            ? getLyovsonPersonInput(author as Lyovson)
            : null
        )
        .filter((author) => author !== null) || undefined,
    keywords: post.topics
      ?.map((topic) => {
        if (typeof topic === "object" && topic !== null) {
          return topic.name || topic.slug || "";
        }

        return "";
      })
      .filter(Boolean),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Posts", url: absoluteUrl(postsRoute()) },
    { name: post.title },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCardHero post={post} />
      <PostTransitionBoundary variant="body">
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
              className="reveal-stagger-3 h-full"
              content={post.content}
              enableGutter={false}
              enableProse={true}
            />
          </GridCardSection>
        </GridCard>
      </PostTransitionBoundary>

      <PostTransitionBoundary variant="rail">
        <aside
          className={cn(
            "col-start-1 col-end-2 row-start-6 row-end-7 grid auto-rows-max gap-4 self-start",
            "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5"
          )}
        >
          {post.references && post.references.length > 0 ? (
            <GridCardReferences references={post.references} />
          ) : null}

          <OptionalErrorBoundary title="Unable to load recommended posts.">
            <Suspense
              fallback={
                <div className="surface-panel surface-loading h-[var(--grid-card-1x1)] w-[var(--grid-card-1x1)] animate-pulse rounded-xl">
                  <Skeleton className="surface-chip h-full w-full" />
                </div>
              }
            >
              <RecommendedPosts
                currentPostId={post.id}
                currentSlug={post.slug}
                recommendedIds={
                  post.recommended_post_ids as number[] | undefined
                }
              />
            </Suspense>
          </OptionalErrorBoundary>
        </aside>
      </PostTransitionBoundary>
    </>
  );
}

async function RecommendedPosts({
  currentPostId,
  currentSlug,
  recommendedIds,
}: {
  currentPostId: number;
  currentSlug?: string | null;
  recommendedIds?: number[];
}) {
  if (!(recommendedIds && recommendedIds.length > 0)) {
    return null;
  }

  const payload = await getPayloadClient();
  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: recommendedIds.length,
    where: {
      ...publishedPostsWhere(),
      id: {
        in: recommendedIds,
      },
    },
  });

  const seenSlugs = new Set<string>();
  const docs = (posts.docs as Post[]).filter((post) => {
    if (post.id === currentPostId) {
      return false;
    }
    if (currentSlug && post.slug === currentSlug) {
      return false;
    }
    if (!post.slug) {
      return true;
    }
    if (seenSlugs.has(post.slug)) {
      return false;
    }
    seenSlugs.add(post.slug);
    return true;
  });
  if (docs.length === 0) {
    return null;
  }

  return <GridCardRelatedPosts posts={docs} />;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("posts");
  cacheLife("static");

  const payload = await getPayloadClient();
  const posts = await payload.find({
    collection: "posts",
    limit: 1000,
    select: {
      slug: true,
    },
    where: publishedPostsWhere(),
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

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug } = await paramsPromise;

  const post = await getPost(slug);
  if (!post) {
    return buildNotFoundMetadata({
      description: "The requested post could not be found",
    });
  }

  const postWithLegacyMeta = post as PostWithLegacyMeta;
  const title = postWithLegacyMeta.seo?.title || post.title;
  const description =
    postWithLegacyMeta.seo?.description ||
    post.description ||
    postWithLegacyMeta.meta?.description ||
    "";
  const metaImage = getPostMetaImage(postWithLegacyMeta);
  const imageUrl = metaImage?.url || null;
  const ogImageAlt = metaImage?.alt || title;
  const keywords = getPostKeywords(post);
  const canonicalRoute = postRoute(slug);

  return buildSeoMetadata({
    title,
    description,
    canonicalPath: canonicalRoute,
    keywords,
    openGraphType: "article",
    publishedTime: post.publishedAt || undefined,
    modifiedTime: post.updatedAt || undefined,
    authors:
      post.populatedAuthors
        ?.map((author) => author.username)
        .filter((username): username is string => Boolean(username))
        .map((username) => absoluteUrl(`/${username}`)) || [],
    creator: getPostTwitterCreator(post),
    image: imageUrl
      ? {
          url: imageUrl,
          width: metaImage?.width || DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
          height: metaImage?.height || DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
          alt: ogImageAlt,
        }
      : undefined,
    other: getPostOtherMetadata(post, keywords),
  });
}
