import type { CollectionSlug } from "payload";
import { noteRoute, postRoute } from "@/utilities/routes";

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: "/posts",
};

interface Props {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (collection === "posts") {
    return postRoute(slug);
  }

  if (collection === "notes") {
    return noteRoute(slug);
  }

  return `/${collection}/${slug}`;
};
