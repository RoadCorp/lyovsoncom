import type { CollectionSlug } from "payload";
import { postRoute } from "@/utilities/routes";

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

  return `/${collection}/${slug}`;
};
