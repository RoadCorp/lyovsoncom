import type { Metadata } from "next";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
} from "@/utilities/seo-metadata";
import { siteConfig } from "@/utilities/site-config";

const DEFAULT_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} - Writing, Projects & Research`,
} as const;

interface LyovsonMetadataOptions {
  canonicalPath: string;
  description: string;
  nextPath?: string;
  openGraphType?: "website" | "profile";
  prevPath?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  robots?: Metadata["robots"];
  title: string;
  twitterCard?: "summary" | "summary_large_image";
}

export function buildLyovsonMetadata({
  canonicalPath,
  description,
  nextPath,
  openGraphType = "website",
  prevPath,
  profile,
  robots,
  title,
  twitterCard = "summary_large_image",
}: LyovsonMetadataOptions): Metadata {
  return buildSeoMetadata({
    title,
    description,
    canonicalPath,
    nextPath,
    prevPath,
    openGraphType,
    profile,
    robots,
    twitterCard,
    image: DEFAULT_OG_IMAGE,
  });
}

export function buildLyovsonNotFoundMetadata(): Metadata {
  return buildNotFoundMetadata();
}
