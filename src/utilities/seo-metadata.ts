import type { Metadata } from "next";
import {
  getCanonicalSiteOrigin,
  getDefaultOgImageUrl,
  getSocialTitle,
  siteConfig,
} from "./site-config";

export const DEFAULT_OPEN_GRAPH_IMAGE_WIDTH = 1200;
export const DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT = 630;

const DEFAULT_OG_IMAGE = {
  url: getDefaultOgImageUrl(),
  width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
  height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  alt: `${siteConfig.name} - Writing, Projects & Research`,
} as const;

interface SeoImageInput {
  alt?: string | null;
  height?: number | null;
  url: string;
  width?: number | null;
}

interface BuildSeoMetadataArgs {
  authors?: string[];
  canonicalPath?: string;
  creator?: string;
  description: string;
  image?: SeoImageInput | null;
  keywords?: string[] | string;
  modifiedTime?: string;
  nextPath?: string;
  openGraphType?: "article" | "profile" | "website";
  other?: Metadata["other"];
  prevPath?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  publishedTime?: string;
  robots?: Metadata["robots"];
  title: string;
  twitterCard?: "summary" | "summary_large_image";
}

function normalizeImage(image: SeoImageInput | null | undefined) {
  if (!image?.url) {
    return DEFAULT_OG_IMAGE;
  }

  return {
    url: image.url,
    alt: image.alt || undefined,
    width: image.width || undefined,
    height: image.height || undefined,
  };
}

function normalizeKeywords(keywords: string[] | string | undefined) {
  if (!keywords) {
    return undefined;
  }

  return Array.isArray(keywords) ? keywords.join(", ") : keywords;
}

export function buildSeoMetadata({
  authors,
  canonicalPath,
  creator = siteConfig.socialHandle,
  description,
  image,
  keywords,
  modifiedTime,
  openGraphType = "website",
  other,
  nextPath,
  prevPath,
  profile,
  publishedTime,
  robots,
  title,
  twitterCard = "summary_large_image",
}: BuildSeoMetadataArgs): Metadata {
  const socialTitle = getSocialTitle(title);
  const normalizedImage = normalizeImage(image);

  return {
    metadataBase: new URL(getCanonicalSiteOrigin()),
    title,
    description,
    keywords: normalizeKeywords(keywords),
    alternates: {
      ...(canonicalPath ? { canonical: canonicalPath } : {}),
      ...(nextPath ? { next: nextPath } : {}),
      ...(prevPath ? { prev: prevPath } : {}),
    },
    openGraph: {
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      type: openGraphType,
      ...(canonicalPath ? { url: canonicalPath } : {}),
      images: [normalizedImage],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
      ...(openGraphType === "profile"
        ? {
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            username: profile?.username,
          }
        : {}),
    },
    twitter: {
      card: twitterCard,
      creator,
      site: siteConfig.socialHandle,
      title: socialTitle,
      description,
      images: [normalizedImage],
    },
    ...(robots ? { robots } : {}),
    ...(other ? { other } : {}),
  };
}

export function buildNotFoundMetadata({
  description = "The requested page could not be found.",
  title = "Not Found",
}: {
  description?: string;
  title?: string;
} = {}): Metadata {
  return buildSeoMetadata({
    title,
    description,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
    twitterCard: "summary",
  });
}
