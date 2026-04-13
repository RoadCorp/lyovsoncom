import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

import { GridCardProject } from "@/components/grid/card/project";
import { SkeletonGrid } from "@/components/grid/skeleton";
import { JsonLd } from "@/components/JsonLd";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getProjects } from "@/utilities/get-projects";
import { getServerSideURL } from "@/utilities/getURL";

export default async function Page() {
  "use cache";

  cacheTag("projects");
  cacheLife("projects");

  const response = await getProjects();

  if (!response) {
    return notFound();
  }

  // Generate CollectionPage schema
  const collectionPageSchema = generateCollectionPageSchema({
    name: "Projects & Research",
    description:
      "Explore projects and research covering technology, programming, design, and creative endeavors.",
    url: `${getServerSideURL()}/projects`,
    itemCount: response.length,
    items: response.map((project) => ({
      url: `${getServerSideURL()}/projects/${project.slug}`,
    })),
  });

  return (
    <>
      <h1 className="sr-only">Projects & Research</h1>

      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        {response.map((project) => (
          <GridCardProject key={project.id} project={project} />
        ))}
      </Suspense>
    </>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "Projects & Research | Lyóvson.com",
  description:
    "Explore projects and research by Rafa and Jess Lyóvson covering technology, programming, design, and creative endeavors.",
  keywords: [
    "projects",
    "research",
    "technology",
    "programming",
    "design",
    "creative projects",
    "Rafa Lyóvson",
    "Jess Lyóvson",
  ],
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    siteName: "Lyóvson.com",
    title: "Projects & Research - Lyóvson.com",
    description:
      "Explore projects and research covering technology, programming, design, and creative endeavors.",
    type: "website",
    url: "/projects",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Projects & Research - Lyóvson.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects & Research - Lyóvson.com",
    description:
      "Explore projects and research covering technology, programming, design, and creative endeavors.",
    creator: "@lyovson",
    site: "@lyovson",
    images: [
      {
        url: "/og-image.png",
        alt: "Projects & Research - Lyóvson.com",
        width: 1200,
        height: 630,
      },
    ],
  },
  other: {
    "article:section": "Projects",
    "article:author": "Rafa Lyóvson, Jess Lyóvson",
  },
};
