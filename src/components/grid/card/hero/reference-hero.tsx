import { ExternalLink } from "lucide-react";
import { Fragment, ViewTransition } from "react";
import {
  REFERENCE_TYPE_LABELS,
  showsLogo,
} from "@/collections/References/fields/type";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid/card";
import { getActivityReferenceIcon } from "@/components/grid/card/activity/shared";
import { GridCardSection } from "@/components/grid/card/section";
import { GRID_HERO_PANELS } from "@/components/grid/layout";
import { Media } from "@/components/Media";
import { CARD_FULL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { MediaFallback } from "@/components/Media/media-fallback";
import { ApexLozenge } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { Reference } from "@/payload-types";
import { getWholes, groupCredits } from "@/utilities/reference-links";
import { referenceRoute } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getReferenceMediaTransitionName,
  getReferenceTitleTransitionName,
} from "@/utilities/view-transitions";
import { HeroStage, heroTitleSize } from "./hero-stage";

const WWW_PREFIX = /^www\./u;

/** "wikipedia.org" from a reference's external link, for its label. */
function linkHost(url: string) {
  try {
    return new URL(url).hostname.replace(WWW_PREFIX, "");
  } catch {
    return null;
  }
}

const REFERENCE_LINK_CLASS =
  "ui-focus-ring tone-heading font-medium underline-offset-4 hover:underline";

function ReferenceLink({ reference }: { reference: Reference }) {
  return (
    <AppLink
      className={REFERENCE_LINK_CLASS}
      href={referenceRoute(reference.slug)}
      prefetch={false}
    >
      {reference.title}
    </AppLink>
  );
}

/** "A, B and C" with each name linked. */
function LinkedList({ references }: { references: Reference[] }) {
  return references.map((reference, index) => (
    <Fragment key={reference.id}>
      {index > 0 && (index === references.length - 1 ? " and " : ", ")}
      <ReferenceLink reference={reference} />
    </Fragment>
  ));
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Linked credits, else the creator as text. */
function ReferenceByline({ reference }: { reference: Reference }) {
  const groups = groupCredits(reference.credits);
  if (groups.length === 0) {
    return reference.creator ? (
      <p className="tone-muted text-sm">{reference.creator}</p>
    ) : null;
  }
  return (
    <p className="tone-muted line-clamp-2 text-sm">
      {groups.map((group, index) => (
        <Fragment key={group.phrase}>
          {index > 0 ? " · " : null}
          {index === 0 ? capitalize(group.phrase) : group.phrase}{" "}
          <LinkedList references={group.agents} />
        </Fragment>
      ))}
    </p>
  );
}

/** "#8 in Cormoran Strike", or "Part of …" without a place. */
function ReferenceWholes({ reference }: { reference: Reference }) {
  const wholes = getWholes(reference);
  if (wholes.length === 0) {
    return null;
  }
  return (
    <p className="tone-muted line-clamp-2 text-sm">
      {wholes.map(({ note, reference: whole }, index) => (
        <Fragment key={whole.id}>
          {index > 0 ? " · " : null}
          {note ? `${note} in ` : "Part of "}
          <ReferenceLink reference={whole} />
        </Fragment>
      ))}
    </p>
  );
}

export const GridCardHeroReference = ({
  className,
  reference,
}: {
  className?: string;
  reference: Reference;
}) => {
  if (!reference.slug) {
    return null;
  }

  const image =
    reference.image && typeof reference.image === "object"
      ? reference.image
      : null;
  const typeLabel = REFERENCE_TYPE_LABELS[reference.type] ?? "Reference";
  const host = reference.url ? linkHost(reference.url) : null;

  return (
    <GridCard className={className} slot="hero">
      <GridCardSection className={GRID_HERO_PANELS.media} flush={true}>
        <ViewTransition
          name={getReferenceMediaTransitionName(reference.slug)}
          {...frontendViewTransitionClasses.sharedMedia}
        >
          {image ? (
            <Media
              className="media-frame flex h-full items-center justify-center"
              credit={true}
              imgClassName={
                showsLogo(reference.type)
                  ? "h-full bg-white object-contain p-8"
                  : "h-full object-cover"
              }
              pictureClassName="h-full"
              priority={true}
              resource={image}
              size={CARD_FULL_IMAGE_SIZE}
            />
          ) : (
            <MediaFallback
              icon={getActivityReferenceIcon(reference.type)}
              label={typeLabel}
            />
          )}
        </ViewTransition>
      </GridCardSection>

      <HeroStage>
        <div className="relative z-1 flex h-full flex-col gap-4 px-6 pt-6 pb-5 md:px-7 md:pt-7 md:pb-6">
          <p className="type-eyebrow flex items-center gap-2">
            <span className="card-eyebrow">{typeLabel}</span>
            {reference.year ? (
              <>
                <ApexLozenge className="ornament-accent" size={9} />
                <span className="tone-muted">{reference.year}</span>
              </>
            ) : null}
          </p>
          <div className="flex flex-1 flex-col justify-center gap-3">
            <ViewTransition
              name={getReferenceTitleTransitionName(reference.slug)}
              {...frontendViewTransitionClasses.sharedTitle}
            >
              <h1
                className={cn(
                  "tone-heading text-balance",
                  heroTitleSize(reference.title)
                )}
              >
                {reference.title}
              </h1>
            </ViewTransition>
            <ReferenceByline reference={reference} />
            <ReferenceWholes reference={reference} />
            {reference.description ? (
              <p className="tone-muted line-clamp-3 text-sm">
                {reference.description}
              </p>
            ) : null}
          </div>
          {reference.url && host ? (
            <a
              className="ui-meta-link ui-focus-ring type-eyebrow inline-flex items-center gap-1.5 self-start"
              href={reference.url}
              rel="noopener"
              target="_blank"
            >
              {host}
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </HeroStage>
    </GridCard>
  );
};
