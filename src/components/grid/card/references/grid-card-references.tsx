import {
  Book,
  BookOpenText,
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

  if (validReferences.length === 0) {
    return null;
  }

  return (
    <GridCard className={cn("col-span-1", className)}>
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-2 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BookOpenText aria-hidden="true" className="tone-muted h-4 w-4" />
          <h3 className="tone-heading font-bold text-base uppercase tracking-wide">
            References
          </h3>
        </div>
        <span className="surface-chip min-w-7 justify-center px-2 py-1 text-xs tabular-nums">
          {validReferences.length}
        </span>
      </GridCardSection>

      <GridCardSection className="col-start-1 col-end-4 row-start-2 row-end-4 flex flex-col gap-2 overflow-y-auto">
        {validReferences.map((reference, index) => {
          const IconComponent = referenceTypeIcons[reference.type] ?? LinkIcon;
          const typeLabel = referenceTypeLabels[reference.type] ?? "Reference";
          const isExternal = hasExternalUrl(reference);

          const imageObj =
            typeof reference.image === "object" && reference.image !== null
              ? reference.image
              : null;

          const content = (
            <div
              className={cn(
                "group surface-row relative grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded-lg p-2",
                getStaggerClass(index),
                isExternal && "ui-interactive"
              )}
            >
              <div className="surface-thumb h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-md">
                {imageObj ? (
                  <Media
                    className="media-frame h-full w-full"
                    imgClassName="object-cover h-full w-full"
                    pictureClassName="h-full w-full"
                    resource={imageObj}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <IconComponent
                      aria-hidden="true"
                      className="tone-muted h-6 w-6"
                    />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="tone-heading font-semibold text-sm leading-snug">
                  <span className="line-clamp-2">{reference.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="surface-chip px-2 py-0.5 text-[11px] uppercase tracking-wide">
                    {typeLabel}
                  </span>
                </div>
                {reference.description && (
                  <p className="tone-muted line-clamp-2 text-xs leading-relaxed">
                    {reference.description}
                  </p>
                )}
              </div>

              {isExternal && (
                <ExternalLink
                  aria-hidden="true"
                  className="ui-group-hover-bright tone-muted h-4 w-4 flex-shrink-0"
                />
              )}
            </div>
          );

          if (isExternal) {
            return (
              <a
                aria-label={`Open reference: ${reference.title}`}
                className="ui-focus-ring block"
                href={reference.url}
                key={reference.id}
                rel="noopener"
                target="_blank"
              >
                {content}
              </a>
            );
          }

          return <div key={reference.id}>{content}</div>;
        })}
      </GridCardSection>
    </GridCard>
  );
};
