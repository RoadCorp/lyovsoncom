import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import type { Project } from "@/payload-types";
import { projectRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getProjectMediaTransitionName,
  getProjectTitleTransitionName,
} from "@/utilities/view-transitions";

export interface GridCardProjectProps {
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  priority?: boolean;
  project: Project;
}

export const GridCardProject = ({
  project,
  className,
  loading,
  fetchPriority,
  priority,
}: GridCardProjectProps) => {
  const { name, slug } = project;
  if (!slug) {
    return null;
  }

  const projectHref = projectRoute(slug);

  return (
    <AppLink
      aria-label={`View ${name} project`}
      className="group glass-interactive"
      href={projectHref}
      prefetch={false}
      transitionTypes={[transitionTypes.drillIn]}
    >
      <GridCard className={className}>
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
                className="glass-media flex h-full items-center justify-center"
                imgClassName="h-full object-cover"
                pictureClassName="h-full"
                resource={project.image}
                {...(loading ? { loading } : {})}
                {...(fetchPriority ? { fetchPriority } : {})}
                {...(priority ? { priority } : {})}
              />
            </ViewTransition>
          </GridCardSection>
        ) : null}
        <GridCardSection className="col-start-1 col-end-4 row-start-3 row-end-4 flex h-full flex-col justify-center">
          <ViewTransition
            name={getProjectTitleTransitionName(slug)}
            {...frontendViewTransitionClasses.sharedTitle}
          >
            <h2 className="glass-text text-center font-bold text-xl transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
              {name}
            </h2>
          </ViewTransition>
        </GridCardSection>
      </GridCard>
    </AppLink>
  );
};

export const GridCardProjectHero = ({
  className,
  project,
}: {
  className?: string;
  project: Project;
}) => {
  const { description, image, name, slug } = project;
  if (!slug) {
    return null;
  }

  return (
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
              className="glass-media flex h-full items-center justify-center"
              imgClassName="h-full object-cover"
              pictureClassName="h-full"
              priority={true}
              resource={image}
            />
          </ViewTransition>
        </GridCardSection>
      ) : null}

      <GridCardSection className="col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7">
        <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <ViewTransition
              name={getProjectTitleTransitionName(slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h1 className="glass-text text-center font-bold text-2xl transition-colors duration-300 md:text-3xl lg:text-4xl">
                {name}
              </h1>
            </ViewTransition>
            {description ? (
              <p className="glass-text-secondary text-left text-base leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </GridCardSection>
    </GridCard>
  );
};
