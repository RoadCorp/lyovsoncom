import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCardEmptyState } from "@/components/grid";
import { GridCardProject } from "@/components/grid/card/project";
import { JsonLd } from "@/components/JsonLd";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLyovsonPortfolioProjects } from "@/utilities/get-lyovson-feed";
import { absoluteUrl } from "@/utilities/routes";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lyovson: username } = await params;

  const response = await getLyovsonPortfolioProjects(username);
  if (!response) {
    return notFound();
  }

  const { user, projects } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} - Portfolio`,
    description: `Project portfolio inferred from published work by ${user.name}.`,
    url: absoluteUrl(`/${username}/portfolio`),
    itemCount: projects.length,
    items: projects
      .filter((project) => project.slug)
      .map((project) => ({
        url: absoluteUrl(`/projects/${project.slug}`),
      })),
  });

  return (
    <>
      <h1 className="sr-only">{user.name} portfolio</h1>
      <JsonLd data={collectionPageSchema} />

      {projects.length > 0 ? (
        projects.map((project) => (
          <GridCardProject key={project.id} project={project} />
        ))
      ) : (
        <GridCardEmptyState
          description={`No project-linked posts were found for ${user.name} yet.`}
          title="Portfolio Coming Soon"
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username } = await params;

  const response = await getLyovsonPortfolioProjects(username);
  if (!response) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = response.user.name || username;
  const title = `${name} Portfolio`;
  const description = `Project portfolio inferred from published work by ${name}.`;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/portfolio`,
  });
}
