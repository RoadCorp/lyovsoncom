import type { Metadata } from "next";

import { absoluteUrl } from "./routes";
import { siteConfig } from "./site-config";

const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  description: siteConfig.defaultDescription,
  images: [
    {
      url: absoluteUrl(siteConfig.defaultOgImagePath),
    },
  ],
  siteName: siteConfig.name,
  title: siteConfig.name,
};

export const mergeOpenGraph = (
  og?: Metadata["openGraph"]
): Metadata["openGraph"] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  };
};
