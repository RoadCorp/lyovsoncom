import { ArrowLeft, FileText } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { GRID_HERO_PANELS } from "@/components/grid/layout";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import { CARD_FULL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
import { ApexLozenge } from "@/components/ornaments";
import { PostTransitionBoundary } from "@/components/post-transitions/post-transition-boundary";
import { TopicPillList } from "@/components/topic-pill";
import { cn } from "@/lib/utils";
import type { Post, Topic } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import { dedupeRelationItemsById } from "@/utilities/dedupe-relation-items-by-id";
import { getPublishedProject } from "@/utilities/public-project";
import {
  estimateReadingTimeMinutes,
  formatReadingTime,
} from "@/utilities/reading-time";
import {
  lyovsonRoute,
  postsRoute,
  projectRoute,
  transitionTypes,
} from "@/utilities/routes";
import { HeroStage, heroTitleSize, LONG_HERO_TITLE } from "./hero-stage";

function PostHeroDescription({
  description,
  title,
}: {
  description: string;
  title: string | null | undefined;
}) {
  // A long title leaves room for two summary lines instead of three.
  const lines = (title?.length ?? 0) > LONG_HERO_TITLE ? 2 : 3;
  return (
    <PostTransitionBoundary variant="dek">
      <p
        className="hero-dek tone-muted text-note leading-relaxed"
        data-lines={lines}
      >
        {description}
      </p>
    </PostTransitionBoundary>
  );
}

/**
 * Back to the archive this page belongs to. Unlike the browser's Back
 * button, a link navigation can carry a transition type, so the shared
 * image and title morph back into their card.
 */
function HeroBackLink({ href, label }: { href: string; label: string }) {
  return (
    <IntentLink
      aria-label={`Back to ${label.toLowerCase()}`}
      className="hero-back-link ui-focus-ring"
      href={href}
      transitionTypes={[transitionTypes.navBack]}
    >
      <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
    </IntentLink>
  );
}

/** Type, date, and reading time above the title. */
function PostHeroEyebrow({ post }: { post: Post }) {
  const postType = post.type || "article";
  const readingMinutes = estimateReadingTimeMinutes(post.content);
  return (
    <p className="type-eyebrow flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      <span
        className="card-eyebrow whitespace-nowrap"
        data-post-type={postType}
      >
        {postType}
      </span>
      {post.publishedAt ? (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <ApexLozenge className="ornament-accent" size={8} />
          <time className="tone-muted" dateTime={post.publishedAt}>
            {formatShortDate(post.publishedAt)}
          </time>
        </span>
      ) : null}
      {readingMinutes ? (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <ApexLozenge className="ornament-accent" size={8} />
          <span className="tone-muted">
            {formatReadingTime(readingMinutes)}
          </span>
        </span>
      ) : null}
    </p>
  );
}

/** Byline and topics at the foot of the title panel. */
function PostHeroFooter({ post }: { post: Post }) {
  const authors = dedupeRelationItemsById(post.populatedAuthors).filter(
    (author) => typeof author === "object" && author.username
  );
  const topics = dedupeRelationItemsById(post.topics).filter(
    (topic): topic is Topic => typeof topic === "object" && Boolean(topic.slug)
  );
  const project = getPublishedProject(post.project);

  return (
    <footer className="hero-footer flex flex-col gap-3 pt-4">
      <p className="tone-muted flex flex-wrap items-baseline gap-x-1.5 text-sm">
        {authors.length > 0 ? <span>By</span> : null}
        {authors.map((author, index) => (
          <span key={author.id}>
            <AppLink
              className="ui-focus-ring tone-heading font-medium underline-offset-4 hover:underline"
              href={lyovsonRoute(author.username as string)}
              prefetch={false}
            >
              {author.name}
            </AppLink>
            {index < authors.length - 1 ? " and" : ""}
          </span>
        ))}
        {project ? (
          <>
            <span>in</span>
            <AppLink
              className="ui-focus-ring tone-heading font-medium underline-offset-4 hover:underline"
              href={projectRoute(project.slug)}
              prefetch={false}
            >
              {project.name}
            </AppLink>
          </>
        ) : null}
      </p>
      {topics.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <TopicPillList
            itemLabel="posts"
            layout="inline"
            max={4}
            topics={topics}
          />
        </div>
      ) : null}
    </footer>
  );
}

export const GridCardHero = ({
  className,
  post,
}: {
  className?: string;
  post: Post;
}) => {
  if (!post.slug) {
    return null;
  }

  return (
    <PostTransitionBoundary variant="heroShell">
      <GridCard className={className} slot="hero">
        {post.featuredImage && typeof post.featuredImage !== "string" ? (
          <GridCardSection className={GRID_HERO_PANELS.media} flush={true}>
            <PostTransitionBoundary slug={post.slug} variant="media">
              <Media
                className="media-frame flex h-full items-center justify-center"
                imgClassName="h-full object-cover"
                pictureClassName="h-full"
                priority={true}
                resource={post.featuredImage}
                size={CARD_FULL_IMAGE_SIZE}
              />
            </PostTransitionBoundary>
          </GridCardSection>
        ) : (
          <GridCardSection className={GRID_HERO_PANELS.media} flush={true}>
            <MediaFallback icon={FileText} label={post.type || "article"} />
          </GridCardSection>
        )}

        <HeroStage>
          <div className="relative z-1 flex h-full flex-col gap-4 px-6 pt-6 pb-5 md:px-7 md:pt-7 md:pb-6">
            <div className="flex items-center justify-between gap-3">
              <PostHeroEyebrow post={post} />
              <HeroBackLink href={postsRoute()} label="Posts" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3">
              <PostTransitionBoundary slug={post.slug} variant="title">
                <h1
                  className={cn(
                    "tone-heading text-balance",
                    heroTitleSize(post.title)
                  )}
                >
                  {post.title}
                </h1>
              </PostTransitionBoundary>
              {post.description ? (
                <PostHeroDescription
                  description={post.description}
                  title={post.title}
                />
              ) : null}
            </div>
            <PostHeroFooter post={post} />
          </div>
        </HeroStage>
      </GridCard>
    </PostTransitionBoundary>
  );
};
