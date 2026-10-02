import { Brain, Calendar, FileText, PenTool, Quote } from "lucide-react";
import { ViewTransition } from "react";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid";
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
  getActivityDateSlug,
  lyovsonRoute,
  projectRoute,
  topicRoute,
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
    return "text-xl md:text-2xl";
  }
  if (length > LONG_HERO_TITLE) {
    return "text-2xl md:text-3xl";
  }
  return "text-2xl md:text-3xl lg:text-4xl";
}

function PostHeroDescription({ description }: { description: string }) {
  return (
    <PostTransitionBoundary variant="dek">
      <p className="tone-muted text-left text-base leading-relaxed">
        {description}
      </p>
    </PostTransitionBoundary>
  );
}

/** Byline under the post title: authors, date, project and topics. */
function PostHeroMeta({ post }: { post: Post }) {
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
    <p className="tone-muted flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
      {authors.map((author) => (
        <AppLink
          className="ui-focus-ring underline-offset-4 hover:underline"
          href={lyovsonRoute(author.username as string)}
          key={author.id}
          prefetch={false}
        >
          {author.name}
        </AppLink>
      ))}
      {post.publishedAt ? (
        <time dateTime={post.publishedAt}>
          {formatShortDate(post.publishedAt)}
        </time>
      ) : null}
      {project ? (
        <AppLink
          className="ui-focus-ring underline-offset-4 hover:underline"
          href={projectRoute(project.slug as string)}
          prefetch={false}
        >
          {project.name}
        </AppLink>
      ) : null}
      {topics.map((topic) => (
        <AppLink
          className="ui-focus-ring underline-offset-4 hover:underline"
          href={topicRoute(topic.slug as string)}
          key={topic.id}
          prefetch={false}
        >
          #{topic.name}
        </AppLink>
      ))}
    </p>
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
          <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
            <div className="mx-auto w-full max-w-3xl space-y-4">
              <PostTransitionBoundary slug={post.slug} variant="title">
                <h1
                  className={cn(
                    "tone-heading text-center font-bold",
                    heroTitleSize(post.title)
                  )}
                >
                  {post.title}
                </h1>
              </PostTransitionBoundary>
              {post.description ? (
                <PostHeroDescription description={post.description} />
              ) : null}
              <PostHeroMeta post={post} />
            </div>
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
