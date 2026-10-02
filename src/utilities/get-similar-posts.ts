import type { Post } from "@/payload-types";
import { getSimilarContent } from "@/utilities/get-similar-content";

export function getSimilarPosts(postId: number, limit = 3): Promise<Post[]> {
  return getSimilarContent("posts", postId, limit);
}
