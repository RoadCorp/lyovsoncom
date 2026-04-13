import { Brain, Calendar, PenTool, Quote } from "lucide-react";
import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard } from "@/components/grid";
import { Media } from "@/components/Media";
import { TopicPill } from "@/components/TopicPill";
import { cn } from "@/lib/utils";
import type { Activity, Note, Post } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import { getActivityDateSlug, topicRoute } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getActivityMediaTransitionName,
  getActivityTitleTransitionName,
  getPostMediaTransitionName,
  getPostTitleTransitionName,
} from "@/utilities/view-transitions";
import { GridCardSection } from "../section";

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
          <ViewTransition
            name={getPostMediaTransitionName(post.slug)}
            {...frontendViewTransitionClasses.sharedMedia}
          >
            <Media
              className="glass-media flex h-full items-center justify-center"
              imgClassName="h-full object-cover"
              pictureClassName="h-full"
              priority={true}
              resource={post.featuredImage}
            />
          </ViewTransition>
        </GridCardSection>
      ) : null}

      <GridCardSection className="col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
        <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <ViewTransition
              name={getPostTitleTransitionName(post.slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h1 className="glass-text text-center font-bold text-2xl transition-colors duration-300 md:text-3xl lg:text-4xl">
                {post.title}
              </h1>
            </ViewTransition>
            {post.description ? (
              <p className="glass-text-secondary text-left text-base leading-relaxed">
                {post.description}
              </p>
            ) : null}
          </div>
        </div>
      </GridCardSection>
    </GridCard>
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
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex h-full flex-col items-center justify-center px-6 py-6">
        <h1 className="glass-text text-center font-bold text-2xl transition-colors duration-300">
          {note.title}
        </h1>
      </GridCardSection>

      <GridCardSection className="col-start-1 col-end-2 row-start-3 row-end-4 flex h-full flex-col items-center justify-end gap-2">
        {note.topics
          ?.filter((topic, index, self) => {
            if (typeof topic !== "object" || !topic?.id) {
              return false;
            }

            return (
              index ===
              self.findIndex((candidate) => {
                return (
                  typeof candidate === "object" && candidate?.id === topic.id
                );
              })
            );
          })
          .map((topic) => {
            if (typeof topic !== "object" || !topic.slug || !topic.id) {
              return null;
            }

            return (
              <AppLink
                aria-label={`View notes about ${topic.name}`}
                className="w-full"
                href={topicRoute(topic.slug)}
                key={topic.id}
                prefetch={false}
              >
                <TopicPill>{topic.name}</TopicPill>
              </AppLink>
            );
          })}
      </GridCardSection>

      <GridCardSection className="col-start-2 col-end-3 row-start-3 row-end-4 flex flex-col justify-evenly gap-2">
        {note.author ? (
          <div className="glass-text-secondary flex items-center gap-2 text-xs capitalize">
            <PenTool aria-hidden="true" className="h-5 w-5" />
            <span className="font-medium">{note.author}</span>
          </div>
        ) : null}

        {note.publishedAt ? (
          <div className="glass-text-secondary flex items-center gap-2 text-xs">
            <Calendar aria-hidden="true" className="h-5 w-5" />
            <time dateTime={note.publishedAt}>
              {formatShortDate(note.publishedAt)}
            </time>
          </div>
        ) : null}
      </GridCardSection>

      <GridCardSection className="col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1">
        {isQuoteType ? (
          <Quote
            aria-hidden="true"
            className="glass-text h-5 w-5 transition-colors duration-300"
          />
        ) : (
          <Brain
            aria-hidden="true"
            className="glass-text h-5 w-5 transition-colors duration-300"
          />
        )}
        <span className="glass-text-secondary text-xs capitalize">
          {typeLabel}
        </span>
      </GridCardSection>
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
    typeof activity.reference === "object" && activity.reference !== null
      ? activity.reference
      : null;

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
              className="glass-media flex h-full items-center justify-center"
              imgClassName="h-full object-cover"
              pictureClassName="h-full"
              priority={true}
              resource={referenceImage}
            />
          </ViewTransition>
        </GridCardSection>
      ) : null}

      <GridCardSection className="col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
        <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <ViewTransition
              name={getActivityTitleTransitionName(dateSlug, activity.slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h1 className="glass-text text-center font-bold text-2xl transition-colors duration-300 md:text-3xl lg:text-4xl">
                {title}
              </h1>
            </ViewTransition>
          </div>
        </div>
      </GridCardSection>
    </GridCard>
  );
};
