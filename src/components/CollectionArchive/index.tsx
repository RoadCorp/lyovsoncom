import type React from "react";
import { ArchiveItems, toArchiveItems } from "@/components/ArchiveItems";
import type { PostSummary } from "@/utilities/post-summary";

export interface Props {
  posts: PostSummary[];
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props;

  return <ArchiveItems items={toArchiveItems(posts, "post")} />;
};
