import { REFERENCE_TYPE_LABELS } from "@/collections/References/fields/type";
import { GridCard, GridCardSection } from "@/components/grid";
import { getActivityReferenceIcon } from "@/components/grid/card/activity/shared";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import { CARD_THUMBNAIL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { cn } from "@/lib/utils";
import type { Reference } from "@/payload-types";
import { referenceRoute, transitionTypes } from "@/utilities/routes";

export interface GridCardReferencesProps {
  className?: string;
  references: Array<number | Reference>;
}

const MAX_STAGGER_INDEX = 6;
const MAX_VISIBLE_REFERENCES = 3;

function getStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
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
    <GridCard className={cn(className)} frameLabel="References">
      {visibleReferences.map((reference, index) => {
        const IconComponent = getActivityReferenceIcon(reference.type);
        const typeLabel = REFERENCE_TYPE_LABELS[reference.type] ?? "Reference";
        const byline = [reference.creator, reference.year]
          .filter(Boolean)
          .join(", ");
        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;
        const staggerClass = getStaggerClass(index);

        const imageObj =
          typeof reference.image === "object" && reference.image !== null
            ? reference.image
            : null;
        const credit = imageObj?.credit;

        const content = (
          <GridCardSection
            className="surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
            flush={true}
          >
            {imageObj ? (
              <Media
                className="media-frame flex h-full items-center justify-center"
                imgClassName={
                  // Organizations carry logos, which must not be cropped and
                  // are drawn for white; the important flag beats ImageMedia's
                  // inline object-fit.
                  reference.type === "organization"
                    ? "h-full bg-white object-contain! p-3"
                    : "h-full object-cover"
                }
                pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                resource={imageObj}
                size={CARD_THUMBNAIL_IMAGE_SIZE}
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
              <h2 className="tone-heading ui-group-hover-dim line-clamp-2 font-medium text-sm">
                {reference.title}
              </h2>
              {byline ? (
                <p className="tone-muted line-clamp-1 text-xs">{byline}</p>
              ) : null}
              {credit ? (
                <p
                  className="tone-muted line-clamp-2 text-[0.6875rem]"
                  title={credit}
                >
                  {credit}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="surface-chip surface-tag">{typeLabel}</span>
              </div>
            </div>
          </GridCardSection>
        );

        // Each reference has a hub page; its external link lives there.
        return (
          <IntentLink
            aria-label={`View reference: ${reference.title}`}
            className={cn(
              "ui-focus-ring group ui-interactive col-start-1 col-end-4",
              rowClass,
              staggerClass
            )}
            href={referenceRoute(reference.slug)}
            key={reference.id}
            transitionTypes={[transitionTypes.drillIn]}
          >
            {content}
          </IntentLink>
        );
      })}
    </GridCard>
  );
};
