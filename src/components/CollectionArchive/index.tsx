import type React from "react";
import { ArchiveItems, toArchiveItems } from "@/components/ArchiveItems";
import type { Post } from "@/payload-types";

export interface Props {
  posts: Post[];
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props;

  return <ArchiveItems items={toArchiveItems(posts, "post")} />;
};
