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
  GridCardTableOfContents,
} from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { OptionalErrorBoundary } from "@/components/optional-error-boundary";
import { FleuronRule } from "@/components/ornaments";
import { PostColophonActions } from "@/components/post-colophon-actions";
import { PostTransitionBoundary } from "@/components/post-transitions/post-transition-boundary";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import RichText from "@/components/RichText";
import { ReadingProgress } from "@/components/reading-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Lyovson, Media, Post } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { formatShortDate } from "@/utilities/date";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import { extractLexicalHeadings } from "@/utilities/extract-lexical-headings";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utilities/generate-json-ld";
import { getPost } from "@/utilities/get-post";
import { getRelatedPosts } from "@/utilities/get-related-content";
import {
  getLyovsonPersonInput,
  getLyovsonSameAs,
} from "@/utilities/lyovson-person";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import { getPayloadClient } from "@/utilities/payload-client";
import { getPublishedProject } from "@/utilities/public-project";
import { absoluteUrl, postRoute, postsRoute } from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

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
  const keywords =
    post.topics
      ?.map((topic) => {
        if (typeof topic === "object" && topic !== null) {
          return topic.name || topic.slug || "";
        }

        return "";
      })
      .filter(Boolean) || [];

  return [...new Set(keywords)];
}

function getPostMetaImage(post: PostWithLegacyMeta) {
  const postImage = post.seo?.image || post.featuredImage || post.meta?.image;
  return postImage && typeof postImage === "object"
    ? (postImage as Media)
    : null;
}

function getPostSectionSlug(post: Post) {
  return getPublishedProject(post.project)?.slug ?? null;
}

const X_PROFILE_PATTERN =
  /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/(?<handle>\w+)\/?$/iu;

/** The first author's X handle; their site username is not an X account. */
function getPostTwitterCreator(post: Post) {
  const author = post.authors?.[0];
  const sameAs =
    typeof author === "object" && author !== null
      ? getLyovsonSameAs(author as Lyovson)
      : undefined;
  const handle = sameAs
    ?.map((url) => url.match(X_PROFILE_PATTERN)?.groups?.handle)
    .find(Boolean);
  return handle ? `@${handle}` : undefined;
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
    ...(projectSlug ? { "ai-project": projectSlug } : {}),
    ...(keywords?.length ? { "ai-topics": keywords.join(",") } : {}),
    ...(aiAuthors ? { "ai-authors": aiAuthors } : {}),
  };
}

function getRelatedPostsGridClass(
  hasContents: boolean,
  hasReferences: boolean
) {
  if (hasContents && hasReferences) {
    return "g2:col-start-2 g2:col-end-3 g2:row-start-4";
  }
  if (hasContents || hasReferences) {
    return "g2:col-start-1 g2:col-end-2 g2:row-start-4";
  }
  return "g2:col-start-1 g2:col-end-2 g2:row-start-2";
}

async function PostPageContent({ params: paramsPromise }: Args) {
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
  const keywords = getPostKeywords(post);
  // Only populated references render a card; without one, related posts take its slot.
  const hasReferences = Boolean(
    post.references?.some((ref) => typeof ref === "object" && ref !== null)
  );
  const headings = extractLexicalHeadings(post.content);
  const hasContents = headings.length >= 3;
  const isArticle = (post.type || "article") === "article";
  const canonicalUrl = absoluteUrl(postRoute(slug));
  const relatedPostsGridClass = getRelatedPostsGridClass(
    hasContents,
    hasReferences
  );

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
    keywords,
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
      <ReadingProgress targetId="post-article-body" />

      <GridCardHero post={post} />
      <PostTransitionBoundary variant="body">
        <GridCard
          className={cn(
            "g2:col-start-1 g2:col-end-3 g2:row-auto g2:row-start-3 g2:w-[var(--grid-card-2x1)]",
            "g3:col-start-2 g3:col-end-4 g3:row-start-2",
            "aspect-auto h-auto"
          )}
          id="post-article-body"
          interactive={false}
        >
          <GridCardSection className="[container-type:inline-size] col-span-3 row-span-3 p-6">
            <RichText
              className={cn(
                "g2:text-[1.125rem] h-full",
                isArticle && "content-prose--article"
              )}
              content={post.content}
              enableGutter={false}
              enableProse={true}
            />
            <FleuronRule variant="finis" />
            <PostColophonActions url={canonicalUrl} />
          </GridCardSection>
        </GridCard>
      </PostTransitionBoundary>

      {/* With two columns the body spans both, so the rail splits: the first
          rail card fills the slot under the menu and the rest follow the body. */}
      <aside
        className={cn(
          "col-start-1 col-end-2 row-start-6 row-end-7 grid auto-rows-max gap-4 self-start",
          "g2:contents",
          "g3:col-start-1 g3:col-end-2 g3:row-start-2 g3:row-end-5 g3:grid"
        )}
      >
        {hasContents ? (
          <PostTransitionBoundary variant="rail">
            <div className="g3:col-auto g2:col-start-1 g2:col-end-2 g3:row-auto g2:row-start-2 g2:self-start">
              <GridCardTableOfContents headings={headings} />
            </div>
          </PostTransitionBoundary>
        ) : null}

        {hasReferences ? (
          <PostTransitionBoundary variant="rail">
            <div
              className={cn(
                "g3:col-auto g2:col-start-1 g2:col-end-2 g3:row-auto g2:self-start",
                hasContents ? "g2:row-start-4" : "g2:row-start-2"
              )}
            >
              <GridCardReferences references={post.references ?? []} />
            </div>
          </PostTransitionBoundary>
        ) : null}

        <PostTransitionBoundary variant="rail">
          <div
            className={cn(
              "g3:col-auto g3:row-auto g2:self-start",
              relatedPostsGridClass
            )}
          >
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
          </div>
        </PostTransitionBoundary>
      </aside>
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

  const posts = await getRelatedPosts(recommendedIds);

  const seenSlugs = new Set<string>();
  const docs = posts.filter((post) => {
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
  const authorNames =
    post.populatedAuthors
      ?.map((author) => author.name)
      .filter((name): name is string => Boolean(name))
      .join(" & ") || "Rafa & Jess Lyóvson";
  const publishedLabel = formatShortDate(post.publishedAt);
  const dynamicOgUrl = buildDynamicOgImageUrl({
    eyebrow: post.type || "article",
    title,
    meta: publishedLabel ? `${authorNames} · ${publishedLabel}` : authorNames,
  });

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
      : {
          url: dynamicOgUrl,
          width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
          height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
          alt: title,
        },
    other: getPostOtherMetadata(post, keywords),
  });
}

export default function PostPage(props: Args) {
  return (
    <PublicPageBoundary skeleton="post">
      <PostPageContent {...props} />
    </PublicPageBoundary>
  );
}
