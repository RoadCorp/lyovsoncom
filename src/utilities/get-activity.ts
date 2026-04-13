import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Activity } from "@/payload-types";
import { publicActivitiesWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";
import { getActivityDateSlug } from "@/utilities/routes";

export async function getActivity(slug: string): Promise<Activity | null> {
  "use cache";
  cacheTag("activities");
  cacheTag(`activity-${slug}`);
  cacheLife("activities");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "activities",
    // Keep participant relation data available for public activity cards.
    // Lyovson read access is private, so relation population needs overrideAccess.
    overrideAccess: true,
    where: {
      ...publicActivitiesWhere(),
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  });

  return (response.docs[0] as Activity) || null;
}

export async function getActivityByDateAndSlug(
  date: string,
  slug: string
): Promise<Activity | null> {
  "use cache";

  if (!(date && slug)) {
    return null;
  }

  const fullPath = `${date}/${slug}`;

  cacheTag("activities");
  cacheTag(`activity-${fullPath}`);
  cacheLife("activities");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "activities",
    // Keep participant relation data available for public activity cards.
    // Lyovson read access is private, so relation population needs overrideAccess.
    overrideAccess: true,
    where: {
      ...publicActivitiesWhere(),
      slug: {
        equals: slug,
      },
    },
    limit: 50,
    depth: 2,
  });

  const matchingActivity = response.docs.find(
    (activity) => getActivityDateSlug(activity as Activity) === date
  );

  return (matchingActivity as Activity) || null;
}

export async function getLatestActivities(
  limit = 12
): Promise<PaginatedDocs<Activity>> {
  "use cache";
  cacheTag("activities");
  cacheTag("homepage");
  cacheLife("activities");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "activities",
    depth: 2,
    limit,
    // Keep participant relation data available for public activity cards.
    // Lyovson read access is private, so relation population needs overrideAccess.
    overrideAccess: true,
    sort: "-finishedAt",
    where: publicActivitiesWhere(),
  });

  return {
    ...result,
    docs: result.docs as Activity[],
  };
}

export async function getPaginatedActivities(
  pageNumber: number,
  limit = 12
): Promise<PaginatedDocs<Activity>> {
  "use cache";
  cacheTag("activities");
  cacheTag(`activities-page-${pageNumber}`);
  cacheLife("activities");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "activities",
    depth: 2,
    limit,
    page: pageNumber,
    // Keep participant relation data available for public activity cards.
    // Lyovson read access is private, so relation population needs overrideAccess.
    overrideAccess: true,
    sort: "-finishedAt",
    where: publicActivitiesWhere(),
  });

  return {
    ...result,
    docs: result.docs as Activity[],
  };
}

export async function getActivityCount() {
  "use cache";
  cacheTag("activities");
  cacheTag("activity-count");
  cacheLife("activities");

  const payload = await getPayloadClient();
  return await payload.count({
    collection: "activities",
    overrideAccess: false,
    where: publicActivitiesWhere(),
  });
}
