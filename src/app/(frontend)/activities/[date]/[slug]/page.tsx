import {
  Book,
  Building2,
  Film,
  Gamepad2,
  Info,
  Mic,
  Music,
  Trophy,
  User,
  Video,
} from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";

import {
  GridCard,
  GridCardActivityReview,
  GridCardHeroActivity,
  GridCardSection,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { Activity } from "@/payload-types";
import { getActivityDateSlug } from "@/utilities/activity-path";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utilities/generate-json-ld";
import { getActivityByDateAndSlug } from "@/utilities/get-activity";
import { getServerSideURL } from "@/utilities/getURL";

interface Args {
  params: Promise<{
    date: string;
    slug: string;
  }>;
}

const activityTypeLabels: Record<string, string> = {
  read: "Read",
  watch: "Watched",
  listen: "Listened",
  play: "Played",
  visit: "Visited",
};

function getActivityTitle(
  activity: Activity,
  referenceTitle: string | null
): string {
  if (referenceTitle) {
    return `${activityTypeLabels[activity.activityType] || activity.activityType} ${referenceTitle}`;
  }
  return activityTypeLabels[activity.activityType] || activity.activityType;
}

const referenceTypeIcons: Record<string, typeof Book> = {
  book: Book,
  movie: Film,
  tvShow: Film,
  videoGame: Gamepad2,
  music: Music,
  podcast: Mic,
  series: Book,
  person: User,
  company: Building2,
  video: Video,
  match: Trophy,
};

function ReferenceTypeIcon({ type }: { type: string }) {
  const Icon = referenceTypeIcons[type] || Info;
  return <Icon aria-hidden="true" className="glass-text h-6 w-6" />;
}

function getParticipants(activity: Activity) {
  const objects =
    activity.participants?.filter(
      (p): p is Exclude<typeof p, number> => typeof p === "object" && p !== null
    ) || [];
  return objects.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
}

function getFinishDateParts(activity: Activity) {
  if (!activity.finishedAt) {
    return null;
  }
  const date = new Date(activity.finishedAt);
  return {
    day: date.getDate(),
    monthYear: date.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    }),
    iso: activity.finishedAt,
  };
}

function getReviews(activity: Activity) {
  if (!activity.reviews || activity.reviews.length === 0) {
    return [];
  }

  return activity.reviews.filter((review) => {
    // Only include reviews that have at least a note or rating
    const hasNote = review.note && review.note.trim().length > 0;
    const hasRating = review.rating !== null && review.rating !== undefined;
    return hasNote || hasRating;
  });
}

export default async function ActivityPage({ params: paramsPromise }: Args) {
  "use cache";

  const { date, slug } = await paramsPromise;
  const fullPath = `${date}/${slug}`;

  cacheTag("activities");
  cacheTag(`activity-${fullPath}`);
  cacheLife("activities");

  const activity = await getActivityByDateAndSlug(date, slug);
  if (!activity) {
    return notFound();
  }

  const referenceObj =
    typeof activity.reference === "object" && activity.reference !== null
      ? activity.reference
      : null;

  const pageTitle = getActivityTitle(activity, referenceObj?.title || null);
  const reviews = getReviews(activity);

  const articleSchema = generateArticleSchema({
    title: pageTitle || "Activity",
    slug: fullPath,
    pathPrefix: "/activities",
    publishedAt: activity.publishedAt || undefined,
    updatedAt: activity.updatedAt || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getServerSideURL() },
    { name: "Activities", url: `${getServerSideURL()}/activities` },
    {
      name: pageTitle || "Activity",
    },
  ]);

  // Get reference info for icon
  const referenceType = referenceObj?.type || "other";
  const activityLabel =
    activityTypeLabels[activity.activityType] || activity.activityType;

  const participants = getParticipants(activity);
  const finishDateParts = getFinishDateParts(activity);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCardHeroActivity activity={activity} title={pageTitle} />

      {/* Info Card - Left side, row 2 on tablet (beside hero's second row) */}
      <GridCard
        className={cn(
          "col-start-1 col-end-2 row-start-4 row-end-5",
          "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-3",
          "g3:col-start-1 g3:col-end-2 g3:row-start-2 g3:row-end-3",
          "g4:col-start-4 g4:col-end-5 g4:row-start-1 g4:row-end-2"
        )}
      >
        {/* Top section - Info text spanning rows 1-2, all columns */}
        <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col justify-center overflow-hidden px-6 py-4">
          {activity.notes ? (
            <div className="flex h-full w-full items-center justify-center text-center">
              <RichText
                className="glass-stagger-1 text-sm"
                content={activity.notes}
                enableGutter={false}
                enableProse={true}
              />
            </div>
          ) : (
            <p className="glass-text-secondary text-center text-sm">
              No additional info
            </p>
          )}
        </GridCardSection>

        {/* Bottom row - Column 1: Activity type icon + label */}
        <GridCardSection className="col-start-1 col-end-2 row-start-3 row-end-4 flex flex-col items-center justify-center gap-1">
          <ReferenceTypeIcon type={referenceType} />
          <span className="glass-text-secondary font-medium text-xs">
            {activityLabel}
          </span>
        </GridCardSection>

        {/* Bottom row - Column 2: Participants with icons */}
        <GridCardSection className="col-start-2 col-end-3 row-start-3 row-end-4 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            {participants.map((participant) => (
              <div
                className="flex flex-col items-center gap-0.5"
                key={participant.id}
              >
                <User aria-hidden="true" className="glass-text h-5 w-5" />
                <span className="glass-text-secondary text-[10px]">
                  {participant.name?.split(" ").at(0) || "?"}
                </span>
              </div>
            ))}
          </div>
        </GridCardSection>

        {/* Bottom row - Column 3: Finish date */}
        <GridCardSection className="col-start-3 col-end-4 row-start-3 row-end-4 flex flex-col items-center justify-center">
          {finishDateParts ? (
            <time
              className="flex flex-col items-center"
              dateTime={finishDateParts.iso}
            >
              <span className="glass-text font-bold text-2xl leading-none">
                {finishDateParts.day}
              </span>
              <span className="glass-text-secondary text-[10px] uppercase tracking-wider">
                {finishDateParts.monthYear}
              </span>
            </time>
          ) : (
            <span className="glass-text-secondary text-xs">—</span>
          )}
        </GridCardSection>
      </GridCard>

      {/* Reviews - Right side, side by side on desktop */}
      {reviews.map((review, index) => {
        // On g3 (desktop): place side by side (2 per row) in columns 2-3
        // Column 2 for even indices (0, 2, 4...), Column 3 for odd indices (1, 3, 5...)
        const isEven = index % 2 === 0;
        const reviewerId =
          typeof review.lyovson === "object"
            ? review.lyovson.id
            : review.lyovson;
        const reviewKey = `review-${reviewerId}-${review.rating ?? "no-rating"}-${review.note?.trim() || "no-note"}`;

        return (
          <GridCardActivityReview
            className={cn(
              "col-start-1 col-end-2",
              "g2:col-start-2 g2:col-end-3",
              isEven
                ? "g3:col-start-2 g3:col-end-3"
                : "g3:col-start-3 g3:col-end-4"
            )}
            key={reviewKey}
            review={review}
          />
        );
      })}
    </>
  );
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("activities");
  cacheLife("static");

  const { getPayload } = await import("payload");
  const configPromise = await import("@payload-config");
  const payload = await getPayload({ config: configPromise.default });
  const activities = await payload.find({
    collection: "activities",
    select: {
      slug: true,
      finishedAt: true,
      startedAt: true,
      publishedAt: true,
    },
    where: {
      _status: {
        equals: "published",
      },
      visibility: {
        equals: "public",
      },
    },
    limit: 1000,
  });

  return ensureStaticParams(
    activities.docs
      .filter((activity) => activity.slug)
      .map((activity) => ({
        date: getActivityDateSlug(activity),
        slug: activity.slug,
      })),
    {
      date: "__placeholder__",
      slug: "__placeholder__",
    }
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  "use cache";

  const { date, slug } = await paramsPromise;
  const fullPath = `${date}/${slug}`;

  cacheTag("activities");
  cacheTag(`activity-${fullPath}`);
  cacheLife("activities");

  const activity = await getActivityByDateAndSlug(date, slug);
  if (!activity) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Not Found | Lyovson.com",
      description: "The requested activity could not be found",
    };
  }

  const referenceObj =
    typeof activity.reference === "object" && activity.reference !== null
      ? activity.reference
      : null;

  const title = referenceObj?.title
    ? `${activityTypeLabels[activity.activityType] || activity.activityType} ${referenceObj.title}`
    : "Activity";

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `${title} | Lyóvson.com`,
    description: `Activity: ${title}`,
    alternates: {
      canonical: `/activities/${fullPath}`,
    },
    openGraph: {
      title: `${title} | Lyóvson.com`,
      description: `Activity: ${title}`,
      url: `${getServerSideURL()}/activities/${fullPath}`,
      siteName: "Lyóvson.com",
      type: "article",
      publishedTime: activity.publishedAt || undefined,
      modifiedTime: activity.updatedAt || undefined,
    },
    twitter: {
      card: "summary",
      title: `${title} | Lyóvson.com`,
      description: `Activity: ${title}`,
    },
  };
}
