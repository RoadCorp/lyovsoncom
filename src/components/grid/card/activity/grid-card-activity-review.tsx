import { Quote, Star, User } from "lucide-react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import type { Lyovson } from "@/payload-types";
import { lyovsonRoute } from "@/utilities/routes";

interface ActivityReview {
  lyovson: number | Lyovson;
  note?: string | null;
  rating?: number | null;
}

interface GridCardActivityReviewProps {
  className?: string;
  review: ActivityReview;
}

const RATING_MAX = 10;
const STARS_PER_ROW = 5;
const REVIEW_EXCERPT_MAX_CHARS = 520;

function buildStarKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
}

function renderRating(rating: number) {
  const fullStars = rating;
  const emptyStars = RATING_MAX - rating;
  const fullTopRow = Math.min(fullStars, STARS_PER_ROW);
  const emptyTopRow = Math.max(0, STARS_PER_ROW - fullStars);
  const fullBottomRow = Math.max(0, fullStars - STARS_PER_ROW);
  const emptyBottomRow = Math.min(emptyStars, STARS_PER_ROW);

  return (
    <div
      aria-label={`${rating} out of ${RATING_MAX}`}
      className="flex flex-col items-center gap-1.5"
      role="img"
    >
      {/* Numeric rating */}
      <div className="flex items-baseline gap-0.5">
        <span className="glass-text font-bold text-2xl leading-none">
          {rating}
        </span>
        <span className="glass-text-secondary text-xs">/{RATING_MAX}</span>
      </div>
      {/* 10 stars in two rows of 5 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-center gap-0.5">
          {buildStarKeys("full-top", fullTopRow).map((starKey) => (
            <Star
              aria-hidden="true"
              className="glass-text h-3 w-3 fill-current"
              key={starKey}
            />
          ))}
          {buildStarKeys("empty-top", emptyTopRow).map((starKey) => (
            <Star
              aria-hidden="true"
              className="glass-text-secondary h-3 w-3 opacity-30"
              key={starKey}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-0.5">
          {buildStarKeys("full-bottom", fullBottomRow).map((starKey) => (
            <Star
              aria-hidden="true"
              className="glass-text h-3 w-3 fill-current"
              key={starKey}
            />
          ))}
          {buildStarKeys("empty-bottom", emptyBottomRow).map((starKey) => (
            <Star
              aria-hidden="true"
              className="glass-text-secondary h-3 w-3 opacity-30"
              key={starKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function GridCardActivityReview({
  review,
  className,
}: GridCardActivityReviewProps) {
  const lyovson =
    typeof review.lyovson === "object" && review.lyovson !== null
      ? (review.lyovson as Lyovson)
      : null;

  const name = lyovson?.name || "Unknown";
  const username = lyovson?.username;
  const hasNote = review.note && review.note.trim().length > 0;
  const rating: number | null =
    typeof review.rating === "number" ? review.rating : null;

  const noteText = review.note || "";
  const isTruncated = noteText.length > REVIEW_EXCERPT_MAX_CHARS;
  const excerpt = isTruncated
    ? noteText.slice(0, REVIEW_EXCERPT_MAX_CHARS).trimEnd()
    : noteText;

  return (
    <GridCard className={className}>
      {/* Top section - Note (styled as quote) */}
      <GridCardSection
        className={cn(
          "col-start-1 col-end-4 row-start-1 row-end-3 flex h-full flex-col overflow-hidden"
        )}
      >
        {hasNote ? (
          <div className="relative flex h-full flex-col justify-start px-6 py-5">
            {/* Opening quote mark */}
            <Quote
              aria-hidden="true"
              className="glass-text-secondary absolute top-3 left-4 h-5 w-5 rotate-180 opacity-40"
            />
            <p
              className={cn(
                "glass-text overflow-hidden text-pretty break-words pr-6 pl-4 text-left text-[15px] italic leading-relaxed",
                "whitespace-pre-line tracking-[-0.01em]"
              )}
            >
              {excerpt}
            </p>

            {isTruncated && (
              <>
                <div className="glass-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-14" />
                <span className="glass-text-secondary pointer-events-none absolute right-6 bottom-4 text-xs tracking-widest">
                  ...
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-6">
            <p className="glass-text-secondary text-sm italic">No note</p>
          </div>
        )}
      </GridCardSection>

      {/* Bottom section - Left: User, Right: Rating */}
      <GridCardSection
        className={
          "col-start-1 col-end-2 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1"
        }
      >
        {username ? (
          <AppLink
            className="glass-focus-ring group block flex flex-col items-center gap-1"
            href={lyovsonRoute(username)}
            prefetch={false}
          >
            <User
              aria-hidden="true"
              className="glass-text glass-group-hover-dim h-5 w-5"
            />
            <span className="glass-text-secondary text-xs capitalize">
              {name.replace(" Lyovson", "")}
            </span>
          </AppLink>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <User aria-hidden="true" className="glass-text h-5 w-5" />
            <span className="glass-text-secondary text-xs capitalize">
              {name.replace(" Lyovson", "")}
            </span>
          </div>
        )}
      </GridCardSection>

      <GridCardSection
        className={
          "col-start-2 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center"
        }
      >
        {rating !== null && renderRating(rating)}
      </GridCardSection>
    </GridCard>
  );
}
