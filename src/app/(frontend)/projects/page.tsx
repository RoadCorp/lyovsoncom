import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardProject } from "@/components/grid/card/project";
import { JsonLd } from "@/components/JsonLd";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getProjects } from "@/utilities/get-projects";
import { absoluteUrl, projectsRoute, projectUrl } from "@/utilities/routes";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default async function Page() {
  const response = await getProjects();

  if (!response) {
    return notFound();
  }

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Projects & Research",
    description:
      "Explore projects and research covering technology, programming, design, and creative endeavors.",
    url: absoluteUrl(projectsRoute()),
    itemCount: response.length,
    items: response
      .filter((project) => project.slug)
      .map((project) => ({ url: projectUrl(project.slug as string) })),
  });

  return (
    <>
      <h1 className="sr-only">Projects & Research</h1>
      <JsonLd data={collectionPageSchema} />
      {response.map((project) => (
        <GridCardProject key={project.id} project={project} />
      ))}
    </>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Projects & Research",
    description:
      "Explore projects and research by Rafa and Jess Lyóvson covering technology, programming, design, and creative endeavors.",
    canonicalPath: projectsRoute(),
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
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Projects & Research",
    },
    other: {
      "article:section": "Projects",
      "article:author": "Rafa Lyóvson, Jess Lyóvson",
    },
  }),
};
