import type { Activity, Note, Post } from "@/payload-types";
import { activityUrl, noteUrl, postUrl } from "@/utilities/routes";

export type MixedFeedItem =
  | { type: "activity"; data: Activity; timestamp: number }
  | { type: "note"; data: Note; timestamp: number }
  | { type: "post"; data: Post; timestamp: number };

type MixedFeedInput =
  | { type: "activity"; data: Activity }
  | { type: "note"; data: Note }
  | { type: "post"; data: Post };

export function getMixedFeedTimestamp(item: MixedFeedInput): number {
  let dateValue = "";

  if (item.type === "activity") {
    dateValue =
      item.data.finishedAt ||
      item.data.startedAt ||
      item.data.publishedAt ||
      "";
  } else if (item.type === "note") {
    dateValue = item.data.publishedAt || item.data.createdAt || "";
  } else {
    dateValue = item.data.publishedAt || item.data.createdAt || "";
  }

  return Date.parse(dateValue) || 0;
}

export function mapPostsToMixedFeedItems(posts: Post[]): MixedFeedItem[] {
  return posts.map((post) => ({
    type: "post",
    data: post,
    timestamp: getMixedFeedTimestamp({ type: "post", data: post }),
  }));
}

export function mapNotesToMixedFeedItems(notes: Note[]): MixedFeedItem[] {
  return notes.map((note) => ({
    type: "note",
    data: note,
    timestamp: getMixedFeedTimestamp({ type: "note", data: note }),
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

export function getMixedFeedItemUrl(item: Omit<MixedFeedItem, "timestamp">) {
  if (item.type === "post") {
    return item.data.slug ? postUrl(item.data.slug) : null;
  }

  if (item.type === "note") {
    return item.data.slug ? noteUrl(item.data.slug) : null;
  }

  return activityUrl(item.data);
}
