import {
  Book,
  Building2,
  ExternalLink,
  Film,
  Gamepad2,
  GraduationCap,
  Link as LinkIcon,
  Mic,
  Music,
  User,
  Video,
} from "lucide-react";

import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import type { Reference } from "@/payload-types";

export interface GridCardReferencesProps {
  className?: string;
  references: Array<number | Reference>;
}

const MAX_STAGGER_INDEX = 6;
const MAX_VISIBLE_REFERENCES = 3;

const referenceTypeIcons: Partial<Record<Reference["type"], typeof Book>> = {
  book: Book,
  movie: Film,
  tvShow: Film,
  videoGame: Gamepad2,
  music: Music,
  podcast: Mic,
  series: Book,
  person: User,
  company: Building2,
  website: LinkIcon,
  article: LinkIcon,
  video: Video,
  repository: LinkIcon,
  tool: LinkIcon,
  social: LinkIcon,
  course: GraduationCap,
  other: LinkIcon,
};

const referenceTypeLabels: Partial<Record<Reference["type"], string>> = {
  book: "Book",
  movie: "Movie",
  tvShow: "TV Show",
  videoGame: "Game",
  music: "Music",
  podcast: "Podcast",
  series: "Series",
  person: "Person",
  company: "Company",
  website: "Website",
  article: "Article",
  video: "Video",
  repository: "Repository",
  tool: "Tool",
  social: "Social",
  course: "Course",
  other: "Other",
};

function getStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

function hasExternalUrl(
  reference: Reference
): reference is Reference & { url: string } {
  return typeof reference.url === "string" && reference.url.trim().length > 0;
}

export const GridCardReferences = ({
  references,
  className,
}: GridCardReferencesProps) => {
  if (!references || references.length === 0) {
    return null;
  }

  const validReferences = references.filter(
    (ref): ref is Reference =>
      typeof ref === "object" && ref !== null && "title" in ref
  );
  const visibleReferences = validReferences.slice(0, MAX_VISIBLE_REFERENCES);

  if (visibleReferences.length === 0) {
    return null;
  }

  return (
    <GridCard className={cn(className)}>
      {visibleReferences.map((reference, index) => {
        const IconComponent = referenceTypeIcons[reference.type] ?? LinkIcon;
        const typeLabel = referenceTypeLabels[reference.type] ?? "Reference";
        const isExternal = hasExternalUrl(reference);
        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;
        const staggerClass = getStaggerClass(index);

        const imageObj =
          typeof reference.image === "object" && reference.image !== null
            ? reference.image
            : null;

        const content = (
          <GridCardSection
            className="grid h-full grid-cols-3 grid-rows-1 gap-2"
            flush={true}
          >
            {imageObj ? (
              <Media
                className="media-frame flex h-full items-center justify-center"
                imgClassName="object-cover h-full"
                pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                resource={imageObj}
              />
            ) : (
              <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex h-full items-center justify-center">
                <IconComponent
                  aria-hidden="true"
                  className="tone-muted ui-group-hover-bright h-8 w-8"
                />
              </div>
            )}

            <div className="col-start-2 col-end-4 row-start-1 row-end-2 flex min-w-0 flex-col justify-center gap-1 pr-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="tone-heading ui-group-hover-dim line-clamp-2 font-medium text-sm">
                  {reference.title}
                </h3>
                {isExternal ? (
                  <ExternalLink
                    aria-hidden="true"
                    className="ui-group-hover-bright tone-muted mt-0.5 h-4 w-4 flex-shrink-0"
                  />
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="surface-chip surface-tag">{typeLabel}</span>
              </div>
            </div>
          </GridCardSection>
        );

        if (isExternal) {
          return (
            <a
              aria-label={`Open reference: ${reference.title}`}
              className={cn(
                "ui-focus-ring group ui-interactive col-start-1 col-end-4",
                rowClass,
                staggerClass
              )}
              href={reference.url}
              key={reference.id}
              rel="noopener"
              target="_blank"
            >
              {content}
            </a>
          );
        }

        return (
          <div
            className={cn(
              "group col-start-1 col-end-4",
              rowClass,
              staggerClass
            )}
            key={reference.id}
          >
            {content}
          </div>
        );
      })}
    </GridCard>
  );
};
