import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  Code2,
  type LucideIcon,
  PenTool,
} from "lucide-react";
import type { CSSProperties } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import {
  CARD_FULL_IMAGE_SIZE,
  CARD_THUMBNAIL_IMAGE_SIZE,
  CARD_WIDE_IMAGE_SIZE,
} from "@/components/Media/image-sizes";
import RichText from "@/components/RichText";
import { TechPill } from "@/components/tech-pill";
import { cn } from "@/lib/utils";
import type { Media as MediaDoc, Project } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import type { ProjectCardData } from "@/utilities/get-projects";
import {
  formatProjectYears,
  getProjectHost,
} from "@/utilities/project-display";
import { projectRoute, transitionTypes } from "@/utilities/routes";

type CaseStudySection = NonNullable<Project["caseStudy"]>[number];
type GalleryItem = NonNullable<Project["gallery"]>[number];
type Highlight = NonNullable<Project["highlights"]>[number];

interface Fact {
  href?: string;
  icon: LucideIcon;
  term: string;
  value: string;
}

function getFacts(project: Project): Fact[] {
  const years = formatProjectYears(project);
  const repositoryHost = getProjectHost(project.repository);
  const facts: (Fact | null)[] = [
    project.client
      ? { icon: Building2, term: "Client", value: project.client }
      : null,
    project.role ? { icon: PenTool, term: "Role", value: project.role } : null,
    years ? { icon: Calendar, term: "Timeline", value: years } : null,
    project.repository && repositoryHost
      ? {
          href: project.repository,
          icon: Code2,
          term: "Source",
          value: repositoryHost,
        }
      : null,
  ];
  return facts.filter((fact) => fact !== null);
}

/** Client, role, timeline and source, one labelled row each. */
export function GridCardProjectFacts({ project }: { project: Project }) {
  const facts = getFacts(project);
  // With a single fact the card would only repeat the hero.
  if (facts.length < 2) {
    return null;
  }

  return (
    <GridCard
      frameLabel="Project"
      style={{ "--grid-internal-rows": facts.length } as CSSProperties}
    >
      {facts.map(({ href, icon: Icon, term, value }) => (
        <GridCardSection
          className="surface-row col-start-1 col-end-4 flex items-center gap-3 px-4"
          key={term}
        >
          <Icon aria-hidden="true" className="card-eyebrow h-5 w-5 shrink-0" />
          <dl className="flex min-w-0 flex-col gap-0.5">
            <dt className="card-eyebrow type-eyebrow">{term}</dt>
            <dd className="tone-heading line-clamp-2 font-medium text-sm">
              {href ? (
                <a
                  aria-label={`${term}: ${value} (opens in a new tab)`}
                  className="ui-focus-ring underline-offset-4 hover:underline"
                  href={href}
                  rel="noopener"
                  target="_blank"
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </dl>
        </GridCardSection>
      ))}
    </GridCard>
  );
}

/** The stack as linked pills with each tool's mark and colour. */
export function GridCardProjectStack({ stack }: { stack: string[] }) {
  const items = stack.filter(Boolean);
  if (items.length === 0) {
    return null;
  }

  return (
    <GridCard frameLabel="Stack">
      <GridCardSection className="surface-rail-panel col-start-1 col-end-4 row-start-1 row-end-4 flex items-center p-4">
        <ul
          aria-label="Built with"
          className="grid w-full grid-cols-2 content-center gap-2"
        >
          {items.map((item) => (
            <li className="min-w-0" key={item}>
              <TechPill linked={true} name={item} size="lg" />
            </li>
          ))}
        </ul>
      </GridCardSection>
    </GridCard>
  );
}

/** Up to four measured numbers, two per row; live ones say so. */
export function GridCardProjectHighlights({
  highlights,
}: {
  highlights: Highlight[];
}) {
  if (highlights.length === 0) {
    return null;
  }

  const columns = highlights.length > 1 ? 2 : 1;
  const rows = highlights.length > 2 ? 2 : 1;

  return (
    <GridCard
      frameLabel="Highlights"
      style={
        {
          "--grid-internal-cols": columns,
          "--grid-internal-rows": rows,
        } as CSSProperties
      }
    >
      {highlights.map((highlight, index) => (
        <GridCardSection
          className={cn(
            "surface-title-stage relative flex flex-col items-center justify-center gap-2 px-3 text-center",
            // An odd last highlight spans the bottom row.
            highlights.length === 3 && index === 2 && "col-span-2"
          )}
          key={highlight.id ?? highlight.label}
        >
          {highlight.live ? (
            <span className="surface-chip surface-tag absolute top-2 right-2">
              Live
              <span className="sr-only">, updated daily</span>
            </span>
          ) : null}
          <span
            className={cn(
              "tone-heading font-bold tabular-nums leading-none",
              highlights.length > 1 ? "text-4xl" : "text-6xl"
            )}
          >
            {highlight.value}
          </span>
          <span className="card-eyebrow type-eyebrow">{highlight.label}</span>
        </GridCardSection>
      ))}
    </GridCard>
  );
}

/** Other work by the same people, in the rows of the related-posts card. */
export function GridCardRelatedProjects({
  projects,
}: {
  projects: ProjectCardData[];
}) {
  const linkable = projects.filter(
    (project): project is ProjectCardData & { slug: string } =>
      Boolean(project.slug)
  );
  if (linkable.length === 0) {
    return null;
  }

  return (
    <GridCard frameLabel="Related">
      {linkable.map((project, index) => {
        const years = formatProjectYears(project);
        return (
          <IntentLink
            aria-label={`View ${project.name} project`}
            className={cn(
              "ui-focus-ring group ui-interactive col-start-1 col-end-4",
              `row-start-${index + 1} row-end-${index + 2}`
            )}
            href={projectRoute(project.slug)}
            key={project.id}
            transitionTypes={[transitionTypes.drillIn]}
          >
            <GridCardSection
              className="surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
              flush={true}
            >
              {typeof project.image === "object" && project.image ? (
                <Media
                  className="media-frame flex h-full items-center justify-center"
                  imgClassName="h-full object-cover"
                  pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                  resource={project.image}
                  size={CARD_THUMBNAIL_IMAGE_SIZE}
                />
              ) : (
                <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex h-full items-center justify-center">
                  <BriefcaseBusiness
                    aria-hidden="true"
                    className="tone-muted h-8 w-8"
                  />
                </div>
              )}
              <div className="col-start-2 col-end-4 row-start-1 row-end-2 flex min-w-0 flex-col justify-center gap-1 pr-3">
                <h2 className="tone-heading ui-group-hover-dim line-clamp-2 font-medium">
                  {project.name}
                </h2>
                {years ? (
                  <span className="card-eyebrow type-eyebrow">{years}</span>
                ) : null}
              </div>
            </GridCardSection>
          </IntentLink>
        );
      })}
    </GridCard>
  );
}

/** The case study's sections, in one reading column like a post body. */
export function ProjectCaseStudy({
  className,
  sections,
}: {
  className?: string;
  sections: CaseStudySection[];
}) {
  return (
    <GridCard
      as="article"
      className={cn("aspect-auto h-auto", className)}
      variant="content"
    >
      <div className="flex flex-col gap-10 p-6">
        {sections.map((section) => (
          <section
            className="mx-auto w-full g3:text-[1.125rem] content-measure content-prose [container-type:inline-size]"
            key={section.id ?? section.heading}
          >
            <h2 className="mt-0">{section.heading}</h2>
            <RichText
              className="g3:text-[1.125rem]"
              content={section.content}
              enableGutter={false}
              enableProse={true}
            />
          </section>
        ))}
      </div>
    </GridCard>
  );
}

function isPortrait(image: MediaDoc) {
  return Boolean(image.width && image.height && image.height > image.width);
}

/** Screenshots: wide ones span the column, phone ones sit in pairs. */
export function ProjectGallery({
  className,
  items,
}: {
  className?: string;
  items: GalleryItem[];
}) {
  const figures = items.filter(
    (item): item is GalleryItem & { image: MediaDoc } =>
      typeof item.image === "object" && item.image !== null
  );
  if (figures.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Gallery"
      className={cn("grid w-full grid-cols-2 gap-[var(--grid-gap)]", className)}
    >
      {figures.map((item) => {
        const portrait = isPortrait(item.image);
        const captured = formatShortDate(item.capturedAt);

        return (
          <GridCard
            as="figure"
            className={cn("aspect-auto h-auto", !portrait && "col-span-2")}
            key={item.id ?? item.image.id}
            variant="content"
          >
            <Media
              alt={item.alt}
              className="media-frame flex items-center justify-center"
              imgClassName="rounded-lg object-cover"
              resource={item.image}
              size={portrait ? CARD_FULL_IMAGE_SIZE : CARD_WIDE_IMAGE_SIZE}
            />
            {item.caption || captured ? (
              <figcaption className="surface-caption m-0">
                <span className="surface-caption-text block">
                  {item.caption}
                  {item.caption && captured ? " · " : null}
                  {captured && item.capturedAt ? (
                    <>
                      Captured{" "}
                      <time dateTime={item.capturedAt}>{captured}</time>
                    </>
                  ) : null}
                </span>
              </figcaption>
            ) : null}
          </GridCard>
        );
      })}
    </section>
  );
}
