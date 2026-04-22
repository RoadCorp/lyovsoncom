import type { Metadata } from "next";

import { getDefaultOgImageUrl, siteConfig } from "./site-config";

const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  description: siteConfig.defaultDescription,
  images: [
    {
      url: getDefaultOgImageUrl(),
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
