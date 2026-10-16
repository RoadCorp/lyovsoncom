import { BriefcaseBusiness, ExternalLink } from "lucide-react";
import { ViewTransition } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import { CARD_FULL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
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
            <GridCardSection
              className="col-start-1 col-end-4 row-start-1 row-end-3"
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
                  resource={project.image}
                  size={CARD_FULL_IMAGE_SIZE}
                  {...(loading ? { loading } : {})}
                  {...(priority ? { priority } : {})}
                />
              </ViewTransition>
            </GridCardSection>
          ) : (
            <GridCardSection
              className="col-start-1 col-end-4 row-start-1 row-end-3"
              flush={true}
            >
              <MediaFallback icon={BriefcaseBusiness} label="Project" />
            </GridCardSection>
          )}
          <GridCardSection className="surface-title-stage col-start-1 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1.5">
            <ViewTransition
              name={getProjectTitleTransitionName(slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h2 className="card-title tone-heading ui-group-hover-dim text-center font-bold text-xl">
                {name}
              </h2>
            </ViewTransition>
            {years ? (
              <p className="card-eyebrow font-mono text-label uppercase tracking-[0.16em]">
                {years}
              </p>
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

  const meta = [project.role, formatProjectYears(project)]
    .filter(Boolean)
    .join(" · ");
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
            className="col-start-1 g3:col-start-1 col-end-4 g3:col-end-4 g3:row-start-1 row-start-1 g3:row-end-4 row-end-4"
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
            className="col-start-1 g3:col-start-1 col-end-4 g3:col-end-4 g3:row-start-1 row-start-1 g3:row-end-4 row-end-4"
            flush={true}
          >
            <MediaFallback icon={BriefcaseBusiness} label="Project" />
          </GridCardSection>
        )}

        <GridCardSection className="surface-title-stage col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
          <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
            <div className="mx-auto w-full max-w-3xl space-y-4">
              <ViewTransition
                name={getProjectTitleTransitionName(slug)}
                {...frontendViewTransitionClasses.sharedTitle}
              >
                <h2 className="tone-heading line-clamp-3 text-center font-bold text-2xl md:text-3xl lg:text-4xl">
                  {name}
                </h2>
              </ViewTransition>
              {meta ? (
                <p className="card-eyebrow text-center font-mono text-label uppercase tracking-[0.16em]">
                  {meta}
                </p>
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
