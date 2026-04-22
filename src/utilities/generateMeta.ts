import type { Metadata } from "next";
import type { Post } from "@/payload-types";
import { getCanonicalURL } from "./getURL";
import { mergeOpenGraph } from "./mergeOpenGraph";
import { postRoute } from "./routes";
import { siteConfig } from "./site-config";

interface LegacyMeta {
  meta?: {
    image?: Post["featuredImage"] | null;
    description?: string | null;
  } | null;
}

export const generateMeta = (args: { doc: Partial<Post> }): Metadata => {
  const { doc } = args;
  const legacyDoc = doc as Partial<Post> & LegacyMeta;

  // Use main fields with fallbacks to old meta fields during migration
  const postImage = doc?.featuredImage || legacyDoc.meta?.image;
  const ogImage =
    typeof postImage === "object" &&
    postImage !== null &&
    "url" in postImage &&
    postImage.url &&
    `${getCanonicalURL()}${postImage.url}`;

  const title = doc?.title || siteConfig.name;
  const description = doc?.description || legacyDoc.meta?.description;

  return {
    metadataBase: new URL(getCanonicalURL()),
    description,
    openGraph: mergeOpenGraph({
      description: description || "",
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: typeof doc?.slug === "string" ? postRoute(doc.slug) : "/",
    }),
    title,
  };
};
