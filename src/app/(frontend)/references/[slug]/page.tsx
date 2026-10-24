import { PublicPageBoundary } from "@/components/public-page-boundary";
export const prefetch = "partial";

import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { ViewTransition } from "react";
import { REFERENCE_TYPE_LABELS } from "@/collections/References/fields/type";
import { ArchiveItems, toArchiveItems } from "@/components/archive-items";
import {
  GridCardActivityReview,
  GridCardHeroReference,
  GridCardReferences,
} from "@/components/grid";
// Imported directly: it renders RichText, which the client-safe grid barrel
// must not pull in.
import { GridCardActivityEntry } from "@/components/grid/card/activity/grid-card-activity-entry";
import { MAX_VISIBLE_REFERENCES } from "@/components/grid/card/references/grid-card-references";
import { JsonLd } from "@/components/json-ld";
import type { Reference } from "@/payload-types";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import {
  getReferenceHub,
  getReferenceSlugs,
  getShownReviews,
  hubHasOwnWords,
  type ReferenceHub,
} from "@/utilities/get-reference";
import {
  getRelatedLists,
  type LinkedReference,
  makerNames,
} from "@/utilities/reference-links";
import {
  absoluteUrl,
  activitiesRoute,
  activityUrl,
  homeRoute,
  postUrl,
  referenceRoute,
} from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
} from "@/utilities/seo-metadata";
import { frontendViewTransitionClasses } from "@/utilities/view-transitions";

interface Args {
  params: Promise<{
    slug: string;
  }>;
}

// The first entry sits where the old activity page's info card did: beside
// the hero on tablet and desktop, under it on phones.
const FIRST_ENTRY_PLACEMENT =
  "col-start-1 col-end-2 row-start-4 row-end-5 g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-3 g3:col-start-1 g3:col-end-2 g3:row-start-2 g3:row-end-3 g4:col-start-4 g4:col-end-5 g4:row-start-1 g4:row-end-2";

/** "Book by Jim Butcher, 2000." */
function describeReference(reference: Reference) {
  const typeLabel = REFERENCE_TYPE_LABELS[reference.type] ?? "Reference";
  const makers = makerNames(reference);
  const byline = makers ? ` by ${makers}` : "";
  const year = reference.year ? `, ${reference.year}` : "";
  return `${typeLabel}${byline}${year}.`;
}

function getHubDescription(reference: Reference) {
  return (
    reference.description ||
    `${describeReference(reference)} The Lyovsons' notes, reviews and writing on ${reference.title}.`
  );
}

function getHubItemUrls({ activities, posts }: ReferenceHub) {
  return [
    ...activities.map((activity) => activityUrl(activity)),
    ...posts.map((post) => (post.slug ? postUrl(post.slug) : null)),
  ].flatMap((url) => (url ? [{ url }] : []));
}

async function ReferencePageContent({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise;

  const hub = await getReferenceHub(slug);
  if (!hub) {
    return notFound();
  }
  const { activities, posts, reference } = hub;
  const url = absoluteUrl(referenceRoute(slug));
  const itemUrls = getHubItemUrls(hub);

  const collectionSchema = generateCollectionPageSchema({
    name: reference.title,
    description: getHubDescription(reference),
    url,
    itemCount: itemUrls.length,
    items: itemUrls,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Activities", url: absoluteUrl(activitiesRoute()) },
    { name: reference.title },
  ]);

  return (
    <ViewTransition key={reference.id} {...frontendViewTransitionClasses.page}>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCardHeroReference reference={reference} />

      {activities.map((activity, index) => (
        <ActivityWithReviews
          activity={activity}
          className={index === 0 ? FIRST_ENTRY_PLACEMENT : undefined}
          key={activity.id}
        />
      ))}

      {getRelatedLists(reference).map(({ items, label }) => (
        <RelatedReferences items={items} key={label} label={label} />
      ))}

      <ArchiveItems items={toArchiveItems(posts, "post")} />
    </ViewTransition>
  );
}

/** One list of linked references, three to a card. */
function RelatedReferences({
  items,
  label,
}: {
  items: LinkedReference[];
  label: string;
}) {
  const notes = Object.fromEntries(
    items.map(({ note, reference }) => [reference.id, note])
  );
  const cards: LinkedReference[][] = [];
  for (let start = 0; start < items.length; start += MAX_VISIBLE_REFERENCES) {
    cards.push(items.slice(start, start + MAX_VISIBLE_REFERENCES));
  }
  return cards.map((card) => (
    <GridCardReferences
      key={card[0].reference.id}
      label={label}
      notes={notes}
      references={card.map(({ reference }) => reference)}
    />
  ));
}

function ActivityWithReviews({
  activity,
  className,
}: {
  activity: ReferenceHub["activities"][number];
  className?: string;
}) {
  return (
    <>
      <GridCardActivityEntry activity={activity} className={className} />
      {getShownReviews(activity).map((review) => {
        const reviewerId =
          typeof review.lyovson === "object"
            ? review.lyovson.id
            : review.lyovson;
        return (
          <GridCardActivityReview
            key={`review-${activity.id}-${reviewerId}`}
            review={review}
          />
        );
      })}
    </>
  );
}

export async function generateStaticParams() {
  const references = await getReferenceSlugs();
  return ensureStaticParams(
    references.map(({ slug }) => ({ slug })),
    { slug: "__placeholder__" }
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug } = await paramsPromise;

  const hub = await getReferenceHub(slug);
  if (!hub) {
    return buildNotFoundMetadata({
      description: "The requested reference could not be found",
    });
  }
  const { reference } = hub;
  const image =
    reference.image && typeof reference.image === "object"
      ? reference.image
      : null;

  return buildSeoMetadata({
    title: makerNames(reference)
      ? `${reference.title} by ${makerNames(reference)}`
      : reference.title,
    description: getHubDescription(reference),
    canonicalPath: referenceRoute(slug),
    modifiedTime: reference.updatedAt,
    twitterCard: "summary",
    image: image?.url
      ? {
          url: absoluteUrl(image.url),
          width: image.width || undefined,
          height: image.height || undefined,
          alt: reference.title,
        }
      : undefined,
    // Catalog facts alone are thin pages; links on them still count.
    ...(hubHasOwnWords(hub) ? {} : { robots: { index: false, follow: true } }),
  });
}

export default function ReferencePage(props: Args) {
  return (
    <PublicPageBoundary skeleton="reference">
      <ReferencePageContent {...props} />
    </PublicPageBoundary>
  );
}
