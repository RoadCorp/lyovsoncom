import {
  BriefcaseBusiness,
  Calendar,
  Camera,
  FileText,
  Mic,
  PenTool,
  Star,
  Video,
} from "lucide-react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { PostDrillInLink } from "@/components/post-transitions/PostDrillInLink";
import { PostTransitionBoundary } from "@/components/post-transitions/PostTransitionBoundary";
import { TopicPill } from "@/components/TopicPill";
import type { Post } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import { dedupeRelationItemsById } from "@/utilities/dedupeRelationItemsById";
import {
  lyovsonRoute,
  postRoute,
  projectRoute,
  topicRoute,
} from "@/utilities/routes";

const MAX_STAGGER_INDEX = 6;

export interface GridCardPostProps {
  className?: string;
  loading?: "lazy" | "eager";
  post: Post;
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

function getStaggerClass(index: number): string {
  return `glass-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

function getProjectLinkData(project: Post["project"]): ProjectLinkData | null {
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
  const iconClassName =
    "glass-text h-5 w-5 transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]";

  return (
    <PostTransitionBoundary variant="cardShell">
      <GridCard className={className}>
        {featuredImage && typeof featuredImage !== "string" ? (
          <GridCardSection
            className="col-start-1 col-end-3 row-start-1 row-end-3"
            flush={true}
          >
            <PostDrillInLink
              aria-label={`Read "${title}"`}
              className="group block h-full overflow-hidden rounded-lg"
              href={postHref}
            >
              <PostTransitionBoundary slug={slug} variant="media">
                <Media
                  className="glass-media flex h-full items-center justify-center"
                  imgClassName="h-full object-cover"
                  pictureClassName="h-full"
                  resource={featuredImage}
                  {...(loading ? { loading } : {})}
                  {...(priority ? { priority } : {})}
                />
              </PostTransitionBoundary>
            </PostDrillInLink>
          </GridCardSection>
        ) : null}

        <GridCardSection className="col-start-1 col-end-3 row-start-3 row-end-4 flex h-full flex-col justify-center">
          <PostDrillInLink className="group block" href={postHref}>
            <PostTransitionBoundary slug={slug} variant="title">
              <h2 className="glass-text text-center font-bold text-xl transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
                {title}
              </h2>
            </PostTransitionBoundary>
          </PostDrillInLink>
        </GridCardSection>

        <GridCardSection className="col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1">
          <PostDrillInLink
            className="group block flex flex-col items-center gap-1"
            href={postHref}
          >
            {postType === "article" ? (
              <FileText aria-hidden="true" className={iconClassName} />
            ) : null}
            {postType === "review" ? (
              <Star aria-hidden="true" className={iconClassName} />
            ) : null}
            {postType === "video" ? (
              <Video aria-hidden="true" className={iconClassName} />
            ) : null}
            {postType === "podcast" ? (
              <Mic aria-hidden="true" className={iconClassName} />
            ) : null}
            {postType === "photo" ? (
              <Camera aria-hidden="true" className={iconClassName} />
            ) : null}
            {["article", "review", "video", "podcast", "photo"].includes(
              postType
            ) ? null : (
              <FileText aria-hidden="true" className={iconClassName} />
            )}
            <span className="glass-text-secondary text-xs capitalize transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
              {postType}
            </span>
          </PostDrillInLink>
        </GridCardSection>

        <GridCardSection className="col-start-3 col-end-4 row-start-1 row-end-2 flex flex-col items-center justify-end gap-2">
          {dedupeRelationItemsById(topics).map((topic, index) => {
            if (typeof topic !== "object" || !topic.slug || !topic.id) {
              return null;
            }

            return (
              <AppLink
                aria-label={`View posts about ${topic.name}`}
                className={`w-full ${getStaggerClass(index)}`}
                href={topicRoute(topic.slug)}
                key={topic.id}
                prefetch={false}
              >
                <TopicPill>{topic.name}</TopicPill>
              </AppLink>
            );
          })}
        </GridCardSection>

        <GridCardSection className="col-start-3 col-end-4 row-start-2 row-end-3 flex flex-col justify-evenly gap-2">
          {dedupeRelationItemsById(populatedAuthors).map((author, index) => {
            if (!(typeof author === "object" && author.username)) {
              return null;
            }

            return (
              <AppLink
                aria-label={`View ${author.name}'s profile`}
                className={`glass-text glass-interactive flex items-center gap-2 transition-colors duration-300 hover:text-[var(--glass-text-secondary)] ${getStaggerClass(index)}`}
                href={lyovsonRoute(author.username)}
                key={author.id}
                prefetch={false}
              >
                <PenTool aria-hidden="true" className="h-5 w-5" />
                <span className="font-medium text-xs">
                  {author.name?.replace(" Lyovson", "")}
                </span>
              </AppLink>
            );
          })}

          <div className="glass-text-secondary flex items-center gap-2 text-xs">
            <Calendar aria-hidden="true" className="h-5 w-5" />
            <time dateTime={publishedAt || undefined}>
              {formatShortDate(publishedAt)}
            </time>
          </div>

          {projectLink ? (
            <AppLink
              aria-label={`View ${projectLink.label} project`}
              className="glass-text glass-interactive flex items-center gap-2 transition-colors duration-300 hover:text-[var(--glass-text-secondary)]"
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
