import type { Post } from "@/payload-types";

export const POST_FILTER_TYPES = [
  "article",
  "review",
  "video",
  "podcast",
  "photo",
] as const;

export type PostFilterType = (typeof POST_FILTER_TYPES)[number];

export const POST_TYPE_LABELS: Record<Post["type"], string> = {
  article: "Articles",
  review: "Reviews",
  video: "Videos",
  podcast: "Podcasts",
  photo: "Photos",
};

const POST_FILTER_TYPE_SET = new Set<string>(POST_FILTER_TYPES);

export function isPostFilterType(value: string): value is PostFilterType {
  return POST_FILTER_TYPE_SET.has(value);
}
