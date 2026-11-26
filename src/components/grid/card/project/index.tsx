import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { ViewTransition } from "react";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import {
  CARD_COVER_IMAGE_SIZE,
  CARD_FULL_IMAGE_SIZE,
} from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
import { ApexLozenge, CornerKnots, FleuronRule } from "@/components/ornaments";
import { TechPill } from "@/components/tech-pill";
import { TopicPill } from "@/components/topic-pill";
import type { Project } from "@/payload-types";
import type { ProjectCardData } from "@/utilities/get-projects";
import {
  formatProjectYears,
  getProjectHost,
} from "@/utilities/project-display";
import { projectRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getArchiveCardTransitionName,
  getProjectMediaTransitionName,
  getProjectTitleTransitionName,
} from "@/utilities/view-transitions";

// A card's rail fits three pills, like a post card's topics.
const MAX_CARD_STACK = 3;

/** Top of the stack and the project's years and client, like a post's rail. */
function ProjectCardRail({
  client,
  stack,
  years,
}: {
  client?: string | null;
  stack: string[];
  years: string | null;
}) {
  // Leave room for the "+N" pill instead of clipping a fourth entry.
  const visible =
    stack.length > MAX_CARD_STACK ? stack.slice(0, MAX_CARD_STACK - 1) : stack;
  const hidden = stack.length - visible.length;

  return (
    <>
      <GridCardSection className="surface-rail-panel card-rail-stack card-topic-stack col-start-3 col-end-4 row-start-1 row-end-2">
        {visible.map((item) => (
          <TechPill className="w-full" key={item} name={item} />
        ))}
        {hidden > 0 ? (
          <TopicPill>
            <span aria-hidden="true">+{hidden}</span>
            <span className="sr-only">
              Also built with {stack.slice(visible.length).join(", ")}
            </span>
          </TopicPill>
        ) : null}
      </GridCardSection>
      <GridCardSection className="surface-rail-panel card-rail-stack card-meta-stack col-start-3 col-end-4 row-start-2 row-end-3">
        {years ? (
          <div className="tone-muted flex items-center gap-2 text-xs">
            <Calendar aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{years}</span>
          </div>
        ) : null}
        {client ? (
          <div className="tone-muted flex items-center gap-2 text-xs">
            <Building2 aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span className="line-clamp-2 text-[0.6875rem] leading-tight">
              {client}
            </span>
          </div>
        ) : null}
      </GridCardSection>
    </>
  );
}

export interface GridCardProjectProps {
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  project: ProjectCardData;
}

export const GridCardProject = ({
  project,
  className,
  loading,
  priority,
}: GridCardProjectProps) => {
  const { name, slug } = project;
  if (!slug) {
    return null;
  }

  const projectHref = projectRoute(slug);
  const years = formatProjectYears(project);
  const stack = project.stack?.filter(Boolean) ?? [];
  // A series has no site of its own to name, so it names what it is.
  const eyebrow =
    project.kind === "series" ? "Writing series" : getProjectHost(project.url);
  // Portfolio work gets the post card's rail; a writing series keeps the
  // full-width image.
  const hasRail =
    project.kind !== "series" && (stack.length > 0 || Boolean(years));
  const mediaPlacement = hasRail
    ? "col-start-1 col-end-3 row-start-1 row-end-3"
    : "col-start-1 col-end-4 row-start-1 row-end-3";

  return (
    <ViewTransition
      name={getArchiveCardTransitionName("project", project.id)}
      {...frontendViewTransitionClasses.archiveCard}
    >
      <IntentLink
        aria-label={`View ${name} project`}
        className="ui-focus-ring group ui-interactive"
        href={projectHref}
        transitionTypes={[transitionTypes.drillIn]}
      >
        <GridCard as="article" className={className}>
          {project.image && typeof project.image !== "string" ? (
            <GridCardSection className={mediaPlacement} flush={true}>
              <ViewTransition
                name={getProjectMediaTransitionName(slug)}
                {...frontendViewTransitionClasses.sharedMedia}
              >
                <Media
                  className="media-frame flex h-full items-center justify-center"
                  imgClassName="h-full object-cover object-top"
                  pictureClassName="h-full"
                  resource={project.image}
                  size={hasRail ? CARD_COVER_IMAGE_SIZE : CARD_FULL_IMAGE_SIZE}
                  {...(loading ? { loading } : {})}
                  {...(priority ? { priority } : {})}
                />
              </ViewTransition>
            </GridCardSection>
          ) : (
            <GridCardSection className={mediaPlacement} flush={true}>
              <MediaFallback icon={BriefcaseBusiness} label="Project" />
            </GridCardSection>
          )}

          {hasRail ? (
            <ProjectCardRail
              client={project.client}
              stack={stack}
              years={years}
            />
          ) : null}

          <GridCardSection className="surface-title-stage col-start-1 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1.5">
            <CornerKnots className="ornament-corner--hover" variant="ticks" />
            {eyebrow ? (
              <span aria-hidden="true" className="card-eyebrow type-eyebrow">
                {eyebrow}
              </span>
            ) : null}
            <ViewTransition
              name={getProjectTitleTransitionName(slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h2 className="card-title tone-heading ui-group-hover-dim text-center text-xl font-bold">
                {name}
              </h2>
            </ViewTransition>
            {!hasRail && years ? (
              <p className="card-eyebrow type-eyebrow">{years}</p>
            ) : null}
          </GridCardSection>
        </GridCard>
      </IntentLink>
    </ViewTransition>
  );
};

export const GridCardProjectHero = ({
  className,
  project,
}: {
  className?: string;
  project: ProjectCardData & Pick<Project, "url">;
}) => {
  const { description, image, name, slug } = project;
  if (!slug) {
    return null;
  }

  const years = formatProjectYears(project);
  const host = getProjectHost(project.url);

  return (
    <ViewTransition
      name={getArchiveCardTransitionName("project-hero", project.id)}
      {...frontendViewTransitionClasses.anchor}
      enter="vt-enter"
    >
      <GridCard
        className={[
          "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
          "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
          "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
          "g4:self-start",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {image && typeof image !== "string" ? (
          <GridCardSection
            className="g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4 col-start-1 col-end-4 row-start-1 row-end-4"
            flush={true}
          >
            <ViewTransition
              name={getProjectMediaTransitionName(slug)}
              {...frontendViewTransitionClasses.sharedMedia}
            >
              <Media
                className="media-frame flex h-full items-center justify-center"
                imgClassName="h-full object-cover"
                pictureClassName="h-full"
                priority={true}
                resource={image}
                size={CARD_FULL_IMAGE_SIZE}
              />
            </ViewTransition>
          </GridCardSection>
        ) : (
          <GridCardSection
            className="g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4 col-start-1 col-end-4 row-start-1 row-end-4"
            flush={true}
          >
            <MediaFallback icon={BriefcaseBusiness} label="Project" />
          </GridCardSection>
        )}

        <GridCardSection className="surface-title-stage g3:col-start-4 g3:col-end-7 g3:row-start-1 g3:row-end-4 col-start-1 col-end-4 row-start-4 row-end-7">
          <CornerKnots
            className="ornament-corner--subtle"
            inset="sm"
            variant="triquetra"
          />
          <div className="relative z-1 flex h-full flex-col items-center justify-center px-6 py-5 md:px-8 md:py-6">
            <div className="mx-auto w-full max-w-3xl space-y-4">
              <ViewTransition
                name={getProjectTitleTransitionName(slug)}
                {...frontendViewTransitionClasses.sharedTitle}
              >
                <h2 className="tone-heading line-clamp-3 text-center text-2xl font-bold md:text-3xl lg:text-4xl">
                  {name}
                </h2>
              </ViewTransition>
              {project.role || years ? (
                <p className="card-eyebrow type-eyebrow flex flex-wrap items-center justify-center gap-2 text-center">
                  {project.role ? <span>{project.role}</span> : null}
                  {project.role && years ? (
                    <ApexLozenge className="ornament-accent" size={9} />
                  ) : null}
                  {years ? <span>{years}</span> : null}
                </p>
              ) : null}
              {description ? (
                <FleuronRule className="max-w-36" variant="knot" />
              ) : null}
              {description ? (
                <p className="tone-muted text-left text-base leading-relaxed">
                  {description}
                </p>
              ) : null}
              {project.url && host ? (
                <div className="flex justify-center">
                  <a
                    aria-label={`Visit ${host} (opens in a new tab)`}
                    className="ui-action-button ui-focus-ring ui-interactive"
                    href={project.url}
                    rel="noopener"
                    target="_blank"
                  >
                    <span>Visit {host}</span>
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </GridCardSection>
      </GridCard>
    </ViewTransition>
  );
};
