import { Quote, Star, StarHalf, User } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { CornerKnots, EternityKnot, FleuronRule } from "@/components/ornaments";
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
const STAR_COUNT = 5;
const POINTS_PER_STAR = RATING_MAX / STAR_COUNT;
const REVIEW_EXCERPT_MAX_CHARS = 520;

function buildStarKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}`);
}

// Ten points on five stars (with halves): two rows of five used to show
// 5/10 as a full first row, which read as five out of five.
function renderRating(rating: number) {
  const fullStars = Math.floor(rating / POINTS_PER_STAR);
  const halfStars = rating % POINTS_PER_STAR === 0 ? 0 : 1;
  const emptyStars = STAR_COUNT - fullStars - halfStars;

  return (
    <div
      aria-label={`${rating} out of ${RATING_MAX}`}
      className="flex flex-col items-center gap-1.5"
      role="img"
    >
      {/* Numeric rating */}
      <div className="flex items-baseline gap-0.5">
        <span className="review-score-value text-2xl leading-none font-bold tabular-nums">
          {rating}
        </span>
        <span className="tone-muted text-xs">/{RATING_MAX}</span>
      </div>
      <FleuronRule className="max-w-16" variant="lozenge" />
      <div className="flex items-center justify-center gap-0.5">
        {buildStarKeys("full", fullStars).map((starKey) => (
          <Star
            aria-hidden="true"
            className="review-score-star h-3.5 w-3.5 fill-current"
            key={starKey}
          />
        ))}
        {halfStars ? (
          <span aria-hidden="true" className="relative h-3.5 w-3.5">
            <Star className="review-score-star-empty absolute inset-0 h-3.5 w-3.5 opacity-35" />
            <StarHalf className="review-score-star absolute inset-0 h-3.5 w-3.5 fill-current" />
          </span>
        ) : null}
        {buildStarKeys("empty", emptyStars).map((starKey) => (
          <Star
            aria-hidden="true"
            className="review-score-star-empty h-3.5 w-3.5 opacity-35"
            key={starKey}
          />
        ))}
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
          "review-note-panel col-start-1 col-end-4 row-start-1 row-end-3 flex h-full flex-col overflow-hidden",
          hasNote && "ornament-braid-rail"
        )}
        flush={true}
      >
        {hasNote ? (
          <div className="relative flex h-full flex-col justify-start py-5 ps-7 pe-5">
            {/* Opening quote mark */}
            <Quote
              aria-hidden="true"
              className="review-quote-mark absolute top-4 left-6 h-4 w-4 rotate-180 opacity-60"
            />
            <p
              className={cn(
                "review-note-copy text-note overflow-hidden ps-6 pe-2 text-left font-serif leading-relaxed text-pretty break-words not-italic",
                "tracking-[-0.01em] whitespace-pre-line"
              )}
            >
              {excerpt}
            </p>

            {isTruncated && (
              <>
                <div className="content-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-14" />
                <span className="tone-muted pointer-events-none absolute right-6 bottom-4 text-xs tracking-widest">
                  ...
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center gap-2.5 px-6 py-6">
            <div className="ornament-lattice" />
            <EternityKnot className="ornament-muted relative z-1" size={18} />
            <p className="review-note-empty relative z-1 text-sm italic">
              No note
            </p>
          </div>
        )}
      </GridCardSection>

      {/* Bottom section - Left: User, Right: Rating */}
      <GridCardSection
        className={
          "surface-rail-panel col-start-1 col-end-2 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1"
        }
      >
        <CornerKnots className="ornament-corner--rest" variant="ticks" />
        {username ? (
          <AppLink
            className="ui-focus-ring group relative z-1 flex flex-col items-center gap-1"
            href={lyovsonRoute(username)}
            prefetch={false}
          >
            <User
              aria-hidden="true"
              className="tone-heading ui-group-hover-dim h-5 w-5"
            />
            <span className="tone-muted text-xs capitalize">
              {name.replace(" Lyovson", "")}
            </span>
          </AppLink>
        ) : (
          <div className="relative z-1 flex flex-col items-center gap-1">
            <User aria-hidden="true" className="tone-heading h-5 w-5" />
            <span className="tone-muted text-xs capitalize">
              {name.replace(" Lyovson", "")}
            </span>
          </div>
        )}
      </GridCardSection>

      <GridCardSection
        className={
          "review-score-panel col-start-2 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center"
        }
      >
        <CornerKnots className="ornament-corner--subtle" variant="ticks" />
        {rating === null ? (
          <EternityKnot className="ornament-muted relative z-1" size={18} />
        ) : (
          <div className="relative z-1">{renderRating(rating)}</div>
        )}
      </GridCardSection>
    </GridCard>
  );
}
