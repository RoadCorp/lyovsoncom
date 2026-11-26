import { ArrowRight, Compass, FileText } from "lucide-react";
import type { Metadata } from "next";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import {
  GridCard,
  GridCardActivityLedger,
  GridCardSection,
} from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { JsonLd } from "@/components/json-ld";
import {
  ApexLozenge,
  BraidedFrieze,
  CornerKnots,
  FleuronRule,
} from "@/components/ornaments";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { cn } from "@/lib/utils";
import { ACTIVITY_FILTER_TYPES } from "@/utilities/activity-type";
import { formatShortDate } from "@/utilities/date";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import {
  getActivityTypeCounts,
  getLatestActivities,
} from "@/utilities/get-activity";
import { getLatestPosts, getPostCount } from "@/utilities/get-post";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import {
  absoluteUrl,
  activitiesRoute,
  activityUrl,
  homeRoute,
  nowRoute,
  postRoute,
  postsRoute,
  postUrl,
  transitionTypes,
} from "@/utilities/routes";
import {
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

const RECENT_ACTIVITY_COUNT = 6;
const RECENT_POST_COUNT = 3;

async function NowPageContent() {
  const [latestActivities, counts, latestPosts, postCount] = await Promise.all([
    getLatestActivities(RECENT_ACTIVITY_COUNT),
    getActivityTypeCounts(),
    getLatestPosts(RECENT_POST_COUNT),
    getPostCount(),
  ]);

  const totalActivities = ACTIVITY_FILTER_TYPES.reduce(
    (sum, type) => sum + (counts[type] ?? 0),
    0
  );

  const schemaItems = [
    ...latestPosts.docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
    ...latestActivities.docs
      .map((activity) => {
        const url = activityUrl(activity);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  ];

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Now & Lately",
    description:
      "A living ledger of what Rafa and Jess Lyóvson have been reading, watching, listening to, playing, and writing lately.",
    url: absoluteUrl(nowRoute()),
    itemCount: schemaItems.length,
    items: schemaItems,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Now" },
  ]);

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCard
        className={cn(
          "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
          "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
          "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
          "g4:self-start"
        )}
      >
        <GridCardSection className="surface-title-stage g3:col-start-1 g3:col-end-5 g3:row-start-1 g3:row-end-4 col-start-1 col-end-4 row-start-1 row-end-5">
          <BraidedFrieze />
          <CornerKnots
            className="ornament-corner--rest"
            edges="bottom"
            variant="ticks"
          />
          <div className="relative z-1 flex h-full flex-col justify-between gap-4 px-6 pt-6 pb-5 md:px-7 md:pt-7 md:pb-6">
            <p className="type-eyebrow flex items-center gap-2">
              <Compass
                aria-hidden="true"
                className="ornament-accent h-3.5 w-3.5"
              />
              <span className="card-eyebrow">Now</span>
              <ApexLozenge className="ornament-accent" size={9} />
              <span className="tone-muted">Living Ledger</span>
            </p>

            <div className="space-y-3">
              <h1 className="tone-heading text-2xl leading-tight font-semibold md:text-3xl">
                Now &amp; Lately
              </h1>
              <p className="tone-body text-sm leading-relaxed">
                An always-current snapshot of what we have been reading,
                watching, listening to, playing, and publishing across the
                archive.
              </p>
            </div>

            <div className="hero-footer flex items-center gap-4 pt-3">
              <IntentLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={activitiesRoute()}
                transitionTypes={[transitionTypes.section]}
              >
                <span>Full Activity Log</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </IntentLink>
            </div>
          </div>
        </GridCardSection>

        <GridCardSection className="surface-rail-panel g3:col-start-5 g3:col-end-7 g3:row-start-1 g3:row-end-4 relative col-start-1 col-end-4 row-start-5 row-end-7 flex flex-col items-center justify-center gap-4 px-5 py-4 text-center">
          <div className="ornament-lattice" />
          <CornerKnots inset="sm" variant="triquetra" />
          <div className="relative z-1 flex w-full flex-col items-center gap-3">
            <div className="space-y-1">
              <p className="tone-heading font-serif text-3xl leading-none font-semibold">
                {totalActivities}
              </p>
              <p className="type-eyebrow tone-muted">Logged Entries</p>
            </div>
            <FleuronRule variant="lozenge" />
            <div className="space-y-1">
              <p className="tone-heading font-serif text-3xl leading-none font-semibold">
                {postCount.totalDocs}
              </p>
              <p className="type-eyebrow tone-muted">Published Posts</p>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      <GridCardActivityLedger counts={counts} />

      {latestPosts.docs.length > 0 ? (
        <GridCard frameLabel="Recent Writing">
          {latestPosts.docs.map((post, index) => {
            if (!post.slug) {
              return null;
            }
            const dateLabel = formatShortDate(post.publishedAt);
            const rowClass = `row-start-${index + 1} row-end-${index + 2}`;

            return (
              <IntentLink
                className={cn(
                  "ui-focus-ring group ui-interactive col-start-1 col-end-4",
                  rowClass
                )}
                href={postRoute(post.slug)}
                key={post.id}
                transitionTypes={[transitionTypes.postDrillIn]}
              >
                <GridCardSection
                  className="surface-row relative flex h-full flex-col justify-center gap-1.5 px-4 py-3 pr-5"
                  flush={true}
                >
                  <p className="type-eyebrow flex items-center gap-2">
                    <FileText
                      aria-hidden="true"
                      className="ornament-accent h-3 w-3 shrink-0"
                    />
                    <span
                      className="card-eyebrow"
                      data-post-type={post.type || "article"}
                    >
                      {post.type || "article"}
                    </span>
                    {dateLabel ? (
                      <>
                        <ApexLozenge className="ornament-muted" size={7} />
                        <span className="tone-muted">{dateLabel}</span>
                      </>
                    ) : null}
                  </p>
                  <h2 className="tone-heading ui-group-hover-dim line-clamp-2 font-serif text-base leading-snug font-semibold">
                    {post.title}
                  </h2>
                  <span aria-hidden="true" className="activity-spine" />
                </GridCardSection>
              </IntentLink>
            );
          })}
          {latestPosts.docs.length < 3 ? (
            <GridCardSection className="surface-rail-panel col-start-1 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <IntentLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={postsRoute()}
                transitionTypes={[transitionTypes.section]}
              >
                <span>All Posts</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </IntentLink>
            </GridCardSection>
          ) : null}
        </GridCard>
      ) : null}

      <ActivitiesArchive activities={latestActivities.docs} />
    </>
  );
}

export default function NowPage() {
  return (
    <PublicPageBoundary>
      <NowPageContent />
    </PublicPageBoundary>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Now & Lately",
    description:
      "A living ledger of what Rafa and Jess Lyóvson have been reading, watching, listening to, playing, and writing lately.",
    canonicalPath: nowRoute(),
    image: {
      url: buildDynamicOgImageUrl({
        eyebrow: "Living Ledger",
        title: "Now & Lately",
        meta: "Recent reading, watching, listening, playing & writing",
      }),
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      alt: "Now & Lately",
    },
  }),
};
