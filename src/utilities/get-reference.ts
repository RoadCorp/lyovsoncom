import { cacheLife, cacheTag } from "next/cache";
import { References } from "@/collections/References";
import type { Activity, Reference } from "@/payload-types";
import {
  publicActivitiesWhere,
  publishedPostsWhere,
} from "@/utilities/content-queries";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { getPayloadClient } from "@/utilities/payload-client";
import { findPostSummaries, type PostSummary } from "@/utilities/post-summary";
import { publicContentSelect } from "@/utilities/public-content-select";

// A hub shows everything public that points at one reference. Real counts
// are a few per reference; the caps only bound a runaway page.
const MAX_HUB_ACTIVITIES = 100;
const MAX_HUB_POSTS = 50;

export interface ReferenceHub {
  activities: Activity[];
  posts: PostSummary[];
  reference: Reference;
}

export async function getReferenceHub(
  slug: string
): Promise<ReferenceHub | null> {
  "use cache";
  // The hub renders references, activities and posts, so any of their
  // collection tags refreshes it.
  cacheTag("references");
  cacheTag(`reference-${slug}`);
  cacheTag("activities");
  cacheTag("posts");
  cacheLife("activities");

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "references",
    // Linked references and their covers; parts also carry their place.
    depth: 2,
    limit: 1,
    populate: { references: { ...References.defaultPopulate, partOf: true } },
    where: { slug: { equals: slug } },
  });
  const reference = docs[0];
  if (!reference) {
    return null;
  }

  const [activities, posts] = await Promise.all([
    payload.find({
      collection: "activities",
      depth: 1,
      limit: MAX_HUB_ACTIVITIES,
      // Participants and reviewers are Lyovsons, which anonymous reads
      // can't populate; publicActivitiesWhere keeps private rows out.
      overrideAccess: true,
      select: publicContentSelect,
      sort: "-finishedAt",
      where: {
        ...publicActivitiesWhere(),
        reference: { equals: reference.id },
      },
    }),
    findPostSummaries(
      {
        ...publishedPostsWhere(),
        or: [
          { reference: { contains: reference.id } },
          { references: { contains: reference.id } },
        ],
      },
      { limit: MAX_HUB_POSTS }
    ),
  ]);

  return {
    activities: activities.docs as Activity[],
    posts: posts.docs,
    reference,
  };
}

/** The reviews worth showing: those with a note or a rating. */
export function getShownReviews(activity: Activity) {
  return (activity.reviews ?? []).filter(
    (review) =>
      Boolean(review.note?.trim()) ||
      (review.rating !== null && review.rating !== undefined)
  );
}

/**
 * Search engines get a hub only when it carries the Lyovsons' own words: an
 * activity note or written review, or a post. A page of catalog
 * facts alone stays out of the index.
 */
export function hubHasOwnWords({ activities, posts }: ReferenceHub) {
  return (
    posts.length > 0 ||
    activities.some(
      (activity) =>
        Boolean(extractLexicalText(activity.notes).trim()) ||
        (activity.reviews ?? []).some((review) => Boolean(review.note?.trim()))
    )
  );
}

/** Slugs of every reference, for static params and the sitemap. */
export async function getReferenceSlugs() {
  "use cache";
  // Creating a reference refreshes no tag; publishing what cites it does.
  cacheTag("references");
  cacheTag("activities");
  cacheTag("posts");
  cacheLife("static");

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "references",
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true, updatedAt: true },
  });
  return docs.filter(
    (doc): doc is typeof doc & { slug: string } => typeof doc.slug === "string"
  );
}
