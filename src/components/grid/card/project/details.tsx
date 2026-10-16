import { Building2, Calendar, Code2, PenTool } from "lucide-react";
import type { CSSProperties } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import {
  CARD_FULL_IMAGE_SIZE,
  CARD_WIDE_IMAGE_SIZE,
} from "@/components/Media/image-sizes";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { Media as MediaDoc, Project } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import {
  formatProjectYears,
  getProjectHost,
} from "@/utilities/project-display";

type CaseStudySection = NonNullable<Project["caseStudy"]>[number];
type GalleryItem = NonNullable<Project["gallery"]>[number];
type Highlight = NonNullable<Project["highlights"]>[number];

/** Client, role, timeline, stack and source code, beside the case study. */
export function GridCardProjectFacts({ project }: { project: Project }) {
  const years = formatProjectYears(project);
  const repositoryHost = getProjectHost(project.repository);
  const stack = project.stack?.filter(Boolean) ?? [];
  const facts = [
    project.client
      ? { icon: Building2, term: "Client", label: project.client }
      : null,
    project.role ? { icon: PenTool, term: "Role", label: project.role } : null,
    years ? { icon: Calendar, term: "Timeline", label: years } : null,
  ].filter((fact) => fact !== null);

  // The hero already shows role and years; the card earns its place only
  // with something the hero doesn't say.
  if (!(project.client || stack.length > 0 || repositoryHost)) {
    return null;
  }

  return (
    <GridCard frameLabel="Project">
      <GridCardSection
        className={cn(
          "surface-rail-panel card-rail-stack card-meta-stack col-start-1 col-end-4 row-start-1 px-5",
          stack.length > 0 ? "row-end-3" : "row-end-4"
        )}
      >
        <dl className="contents">
          {facts.map(({ icon: Icon, label, term }) => (
            <div
              className="tone-muted flex items-center gap-2 text-sm"
              key={term}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <dt className="sr-only">{term}</dt>
              <dd className="min-w-0">{label}</dd>
            </div>
          ))}
        </dl>
        {project.repository && repositoryHost ? (
          <a
            aria-label={`Source code on ${repositoryHost} (opens in a new tab)`}
            className="ui-meta-link ui-focus-ring text-sm"
            href={project.repository}
            rel="noopener"
            target="_blank"
          >
            <Code2 aria-hidden="true" className="h-5 w-5" />
            <span>Source on {repositoryHost}</span>
          </a>
        ) : null}
      </GridCardSection>

      {stack.length > 0 ? (
        <GridCardSection className="surface-rail-panel card-rail-stack col-start-1 col-end-4 row-start-3 row-end-4 px-4">
          <ul
            aria-label="Built with"
            className="flex flex-wrap content-center justify-center gap-1.5"
          >
            {stack.map((item) => (
              <li className="surface-chip surface-tag" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </GridCardSection>
      ) : null}
    </GridCard>
  );
}

/** Up to four measured numbers, two per row. */
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
            "flex flex-col items-center justify-center gap-1 px-3 text-center",
            // An odd last highlight spans the bottom row.
            highlights.length === 3 && index === 2 && "col-span-2"
          )}
          key={highlight.id ?? highlight.label}
        >
          <span className="tone-heading font-bold text-3xl leading-none">
            {highlight.value}
          </span>
          <span className="tone-muted text-label uppercase tracking-wider">
            {highlight.label}
          </span>
        </GridCardSection>
      ))}
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
            className="mx-auto w-full content-prose"
            key={section.id ?? section.heading}
          >
            <h2 className="mt-0">{section.heading}</h2>
            <RichText
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
