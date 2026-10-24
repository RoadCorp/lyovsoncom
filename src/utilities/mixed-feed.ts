import type { Activity } from "@/payload-types";
import type { PostSummary } from "@/utilities/post-summary";

export type MixedFeedItem =
  | { type: "activity"; data: Activity; timestamp: number }
  | { type: "post"; data: PostSummary; timestamp: number };

type MixedFeedInput =
  | { type: "activity"; data: Activity }
  | { type: "post"; data: PostSummary };

export function getMixedFeedTimestamp(item: MixedFeedInput): number {
  let dateValue = "";

  if (item.type === "activity") {
    dateValue =
      item.data.finishedAt ||
      item.data.startedAt ||
      item.data.publishedAt ||
      "";
  } else {
    dateValue = item.data.publishedAt || item.data.createdAt || "";
  }

  return Date.parse(dateValue) || 0;
}

export function mapPostsToMixedFeedItems(
  posts: PostSummary[]
): MixedFeedItem[] {
  return posts.map((post) => ({
    type: "post",
    data: post,
    timestamp: getMixedFeedTimestamp({ type: "post", data: post }),
  }));
}

export function mapActivitiesToMixedFeedItems(
  activities: Activity[]
): MixedFeedItem[] {
  return activities.map((activity) => ({
    type: "activity",
    data: activity,
    timestamp: getMixedFeedTimestamp({ type: "activity", data: activity }),
  }));
}

export function sortMixedFeedItems<T extends { timestamp: number }>(
  items: T[]
) {
  return [...items].sort((left, right) => right.timestamp - left.timestamp);
}
