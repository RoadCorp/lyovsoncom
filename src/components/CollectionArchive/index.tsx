import type React from "react";
import { ArchiveItems } from "@/components/ArchiveItems";
import type { Post } from "@/payload-types";

export interface Props {
  posts: Post[];
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props;

  return (
    <ArchiveItems
      items={posts.flatMap((post) =>
        typeof post === "object" && post !== null
          ? [{ type: "post" as const, data: post }]
          : []
      )}
    />
  );
};
