import {
  ArrowLeft,
  Brain,
  Calendar,
  FileText,
  PenTool,
  Quote,
} from "lucide-react";
import { ViewTransition } from "react";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import { CARD_FULL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
import { PostTransitionBoundary } from "@/components/post-transitions/post-transition-boundary";
import { TopicPillList } from "@/components/topic-pill";
import { cn } from "@/lib/utils";
import type { Activity, Note, Post, Topic } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import { dedupeRelationItemsById } from "@/utilities/dedupe-relation-items-by-id";
import {
  activitiesRoute,
  getActivityDateSlug,
  lyovsonRoute,
  notesRoute,
  postsRoute,
  projectRoute,
  transitionTypes,
} from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getActivityMediaTransitionName,
  getActivityTitleTransitionName,
  getNoteMetaTransitionName,
  getNoteTitleTransitionName,
} from "@/utilities/view-transitions";
import { GridCardSection } from "../section";

const LONG_HERO_TITLE = 50;
const VERY_LONG_HERO_TITLE = 80;

// The hero title panel has a fixed height, so long titles step down a size
// instead of overflowing it (they are page headings, so they aren't clamped).
function heroTitleSize(title: string | null | undefined) {
  const length = title?.length ?? 0;
  if (length > VERY_LONG_HERO_TITLE) {
    return "text-lg leading-snug md:text-xl";
  }
  if (length > LONG_HERO_TITLE) {
    return "text-[1.5rem] leading-[1.18] md:text-[1.625rem]";
  }
  return "text-[1.625rem] leading-[1.12] md:text-[2rem]";
}

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

/** Type and date above the title. */
function PostHeroEyebrow({ post }: { post: Post }) {
  const postType = post.type || "article";
  return (
    <p className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.16em]">
      <span className="card-eyebrow" data-post-type={postType}>
        {postType}
      </span>
      {post.publishedAt ? (
        <>
          <span aria-hidden="true" className="tone-muted">
            ·
          </span>
          <time className="tone-muted" dateTime={post.publishedAt}>
            {formatShortDate(post.publishedAt)}
          </time>
        </>
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
  const project =
    post.project && typeof post.project === "object" && post.project.slug
      ? post.project
      : null;

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
              href={projectRoute(project.slug as string)}
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
      <GridCard
        className={cn(
          "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
          "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
          "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
          "g4:self-start",
          className
        )}
      >
        {post.featuredImage && typeof post.featuredImage !== "string" ? (
          <GridCardSection
            className={cn(
              "col-start-1 col-end-4 row-start-1 row-end-4",
              "g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4"
            )}
            flush={true}
          >
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
          <GridCardSection
            className={cn(
              "col-start-1 col-end-4 row-start-1 row-end-4",
              "g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4"
            )}
            flush={true}
          >
            <MediaFallback icon={FileText} label={post.type || "article"} />
          </GridCardSection>
        )}

        <GridCardSection className="surface-title-stage col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
          <div className="flex h-full flex-col gap-4 px-6 py-5 md:px-7 md:py-6">
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
        </GridCardSection>
      </GridCard>
    </PostTransitionBoundary>
  );
};

export const GridCardHeroNote = ({
  className,
  note,
}: {
  className?: string;
  note: Note;
}) => {
  const isQuoteType = note.type === "quote";
  const typeLabel = isQuoteType ? "quote" : "thought";

  return (
    <GridCard
      className={cn(
        "col-start-1 col-end-2 row-start-2 row-end-3",
        "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-2",
        "g3:col-start-2 g3:col-end-3 g3:row-start-1 g3:row-end-2",
        "g4:self-start",
        className
      )}
    >
      <GridCardSection className="surface-title-stage col-start-1 col-end-4 row-start-1 row-end-3 flex h-full flex-col items-center justify-center px-6 py-6">
        <div className="absolute top-3 right-4">
          <HeroBackLink href={notesRoute()} label="Notes" />
        </div>
        <ViewTransition
          name={getNoteTitleTransitionName(note.slug || String(note.id))}
          {...frontendViewTransitionClasses.sharedTitle}
        >
          <h1 className="tone-heading text-center font-bold text-2xl">
            {note.title}
          </h1>
        </ViewTransition>
      </GridCardSection>

      <ViewTransition
        name={getNoteMetaTransitionName(note.slug || String(note.id), "topics")}
        {...frontendViewTransitionClasses.sharedMeta}
      >
        <GridCardSection className="surface-rail-panel card-rail-stack card-topic-stack col-start-1 col-end-2 row-start-3 row-end-4 h-full">
          <TopicPillList
            itemLabel="notes"
            topics={dedupeRelationItemsById(note.topics).filter(
              (topic) => typeof topic === "object"
            )}
          />
        </GridCardSection>
      </ViewTransition>

      <ViewTransition
        name={getNoteMetaTransitionName(note.slug || String(note.id), "byline")}
        {...frontendViewTransitionClasses.sharedMeta}
      >
        <GridCardSection className="surface-rail-panel card-rail-stack card-meta-stack col-start-2 col-end-3 row-start-3 row-end-4">
          {note.author ? (
            <div className="tone-muted flex items-center gap-2 text-xs capitalize">
              <PenTool aria-hidden="true" className="h-5 w-5" />
              <span className="font-medium">{note.author}</span>
            </div>
          ) : null}

          {note.publishedAt ? (
            <div className="tone-muted flex items-center gap-2 text-xs">
              <Calendar aria-hidden="true" className="h-5 w-5" />
              <time dateTime={note.publishedAt}>
                {formatShortDate(note.publishedAt)}
              </time>
            </div>
          ) : null}
        </GridCardSection>
      </ViewTransition>

      <ViewTransition
        name={getNoteMetaTransitionName(note.slug || String(note.id), "type")}
        {...frontendViewTransitionClasses.sharedMeta}
      >
        <GridCardSection className="surface-rail-panel col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1">
          {isQuoteType ? (
            <Quote aria-hidden="true" className="tone-heading h-5 w-5" />
          ) : (
            <Brain aria-hidden="true" className="tone-heading h-5 w-5" />
          )}
          <span className="tone-muted text-xs capitalize">{typeLabel}</span>
        </GridCardSection>
      </ViewTransition>
    </GridCard>
  );
};

export const GridCardHeroActivity = ({
  className,
  activity,
  title,
}: {
  className?: string;
  activity: Activity;
  title: string;
}) => {
  const referenceObj =
    typeof activity.reference === "object" ? activity.reference : null;

  const referenceImage =
    referenceObj?.image && typeof referenceObj.image === "object"
      ? referenceObj.image
      : null;

  if (!activity.slug) {
    return null;
  }

  const dateSlug = getActivityDateSlug(activity);

  return (
    <GridCard
      className={cn(
        "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
        "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
        "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
        "g4:self-start",
        className
      )}
    >
      {referenceImage ? (
        <GridCardSection
          className={cn(
            "col-start-1 col-end-4 row-start-1 row-end-4",
            "g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4"
          )}
          flush={true}
        >
          <ViewTransition
            name={getActivityMediaTransitionName(dateSlug, activity.slug)}
            {...frontendViewTransitionClasses.sharedMedia}
          >
            <Media
              className="media-frame flex h-full items-center justify-center"
              imgClassName="h-full object-cover"
              pictureClassName="h-full"
              priority={true}
              resource={referenceImage}
              size={CARD_FULL_IMAGE_SIZE}
            />
          </ViewTransition>
        </GridCardSection>
      ) : null}

      <GridCardSection className="surface-title-stage col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
        <div className="absolute top-3 right-4">
          <HeroBackLink href={activitiesRoute()} label="Activities" />
        </div>
        <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <ViewTransition
              name={getActivityTitleTransitionName(dateSlug, activity.slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h1
                className={cn(
                  "tone-heading text-center font-bold",
                  heroTitleSize(title)
                )}
              >
                {title}
              </h1>
            </ViewTransition>
          </div>
        </div>
      </GridCardSection>
    </GridCard>
  );
};
