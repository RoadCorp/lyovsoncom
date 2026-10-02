import { BriefcaseBusiness, Calendar, FileText, PenTool } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { CARD_COVER_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
import { PostDrillInLink } from "@/components/post-transitions/post-drill-in-link";
import { PostTransitionBoundary } from "@/components/post-transitions/post-transition-boundary";
import { TopicPillList } from "@/components/topic-pill";
import { formatShortDate } from "@/utilities/date";
import { dedupeRelationItemsById } from "@/utilities/dedupe-relation-items-by-id";
import type { PostSummary } from "@/utilities/post-summary";
import { lyovsonRoute, postRoute, projectRoute } from "@/utilities/routes";

export interface GridCardPostProps {
  className?: string;
  loading?: "lazy" | "eager";
  post: PostSummary;
  priority?: boolean;
}

interface ProjectLinkData {
  href:
    | ReturnType<typeof projectRoute>
    | ReturnType<typeof postRoute> extends infer _T
    ? string
    : never;
  key: number | string;
  label: string;
}

function getProjectLinkData(
  project: PostSummary["project"]
): ProjectLinkData | null {
  if (!project) {
    return null;
  }

  if (typeof project === "number" || typeof project === "string") {
    return {
      href: "/projects",
      key: project,
      label: "Project",
    };
  }

  const projectName =
    typeof project.name === "string" && project.name.trim().length > 0
      ? project.name
      : "Project";

  return {
    href:
      typeof project.slug === "string" && project.slug.trim().length > 0
        ? projectRoute(project.slug)
        : "/projects",
    key: project.id ?? projectName,
    label: projectName,
  };
}

export const GridCardPostFull = ({
  post,
  className,
  loading,
  priority,
}: GridCardPostProps) => {
  const {
    topics,
    project,
    populatedAuthors,
    featuredImage,
    publishedAt,
    title,
    slug,
    type,
  } = post;

  if (!slug) {
    return null;
  }

  const postHref = postRoute(slug);
  const postType = type || "article";
  const projectLink = getProjectLinkData(project);

  return (
    <PostTransitionBoundary variant="cardShell">
      <GridCard as="article" className={className}>
        {featuredImage && typeof featuredImage !== "string" ? (
          <GridCardSection
            className="col-start-1 col-end-3 row-start-1 row-end-3"
            flush={true}
          >
            {/* Pointer shortcut only: the title link is the card's one tab stop. */}
            <PostDrillInLink
              aria-hidden="true"
              className="group block h-full overflow-hidden rounded-lg"
              href={postHref}
              tabIndex={-1}
            >
              <PostTransitionBoundary slug={slug} variant="media">
                <Media
                  className="media-frame flex h-full items-center justify-center"
                  imgClassName="h-full object-cover"
                  pictureClassName="h-full"
                  resource={featuredImage}
                  size={CARD_COVER_IMAGE_SIZE}
                  {...(loading ? { loading } : {})}
                  {...(priority ? { priority } : {})}
                />
              </PostTransitionBoundary>
            </PostDrillInLink>
          </GridCardSection>
        ) : (
          <GridCardSection
            className="col-start-1 col-end-3 row-start-1 row-end-3"
            flush={true}
          >
            <MediaFallback icon={FileText} />
          </GridCardSection>
        )}

        <GridCardSection className="surface-title-stage col-start-1 col-end-4 row-start-3 row-end-4 flex h-full flex-col justify-center">
          <PostDrillInLink
            className="ui-focus-ring group flex h-full flex-col items-center justify-center gap-2"
            href={postHref}
          >
            <span
              aria-hidden="true"
              className="card-eyebrow font-mono text-label uppercase tracking-[0.16em]"
              data-post-type={postType}
            >
              {postType}
            </span>
            <PostTransitionBoundary slug={slug} variant="title">
              <h2 className="card-title tone-heading ui-group-hover-dim text-center font-bold text-xl">
                {title}
              </h2>
            </PostTransitionBoundary>
          </PostDrillInLink>
        </GridCardSection>

        <GridCardSection className="surface-rail-panel card-rail-stack card-topic-stack col-start-3 col-end-4 row-start-1 row-end-2">
          <TopicPillList
            allTopicsHref={postHref}
            itemLabel="posts"
            topics={dedupeRelationItemsById(topics).filter(
              (topic) => typeof topic === "object"
            )}
          />
        </GridCardSection>

        <GridCardSection className="surface-rail-panel card-rail-stack card-meta-stack col-start-3 col-end-4 row-start-2 row-end-3">
          {dedupeRelationItemsById(populatedAuthors).map((author) => {
            if (!(typeof author === "object" && author.username)) {
              return null;
            }

            return (
              <AppLink
                aria-label={`View ${author.name}'s profile`}
                className={"ui-meta-link ui-focus-ring ui-interactive"}
                href={lyovsonRoute(author.username)}
                key={author.id}
                prefetch={false}
              >
                <PenTool aria-hidden="true" className="h-5 w-5" />
                <span className="font-medium text-xs">
                  {author.name?.split(" ").at(0)}
                </span>
              </AppLink>
            );
          })}

          <div className="tone-muted flex items-center gap-2 text-xs">
            <Calendar aria-hidden="true" className="h-5 w-5" />
            <time dateTime={publishedAt || undefined}>
              {formatShortDate(publishedAt)}
            </time>
          </div>

          {projectLink ? (
            <AppLink
              aria-label={`View ${projectLink.label} project`}
              className="ui-meta-link ui-focus-ring ui-interactive"
              href={projectLink.href}
              prefetch={false}
            >
              <BriefcaseBusiness aria-hidden="true" className="h-5 w-5" />
              <span className="font-medium text-xs">{projectLink.label}</span>
            </AppLink>
          ) : null}
        </GridCardSection>
      </GridCard>
    </PostTransitionBoundary>
  );
};
