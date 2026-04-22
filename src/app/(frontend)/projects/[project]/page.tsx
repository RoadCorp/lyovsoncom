import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { GridCardProjectHero } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import type { Media, Project } from "@/payload-types";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getProject } from "@/utilities/get-project";
import { getProjectPosts } from "@/utilities/get-project-posts";
import { getPayloadClient } from "@/utilities/payload-client";
import {
  absoluteUrl,
  postRoute,
  projectPageRoute,
  projectRoute,
  projectsRoute,
} from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

interface PageProps {
  params: Promise<{
    project: string;
  }>;
}

type ProjectWithSeo = Project & {
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: Media | number | null;
  };
};

function getProjectSeoImage(project: ProjectWithSeo) {
  if (project.seo?.image && typeof project.seo.image === "object") {
    return project.seo.image as Media;
  }

  if (project.image && typeof project.image === "object") {
    return project.image as Media;
  }

  return null;
}

export default async function Page({ params: paramsPromise }: PageProps) {
  const { project: projectSlug } = await paramsPromise;

  const project = await getProject(projectSlug);
  if (!project) {
    return notFound();
  }

  const response = await getProjectPosts(projectSlug);
  if (!response) {
    return notFound();
  }

  const { docs, page, totalPages } = response;
  const collectionPageSchema = generateCollectionPageSchema({
    name: project.name,
    description: project.description || `Posts from ${project.name}`,
    url: absoluteUrl(projectRoute(projectSlug)),
    itemCount: response.totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({
        url: absoluteUrl(postRoute(post.slug as string)),
      })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Projects", url: absoluteUrl(projectsRoute()) },
    { name: project.name },
  ]);

  return (
    <>
      <h1 className="sr-only">{project.name}</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardProjectHero project={project} />
      <CollectionArchive posts={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) =>
            projectPageRoute(projectSlug, pageNumber)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: PageProps): Promise<Metadata> {
  const { project: projectSlug } = await paramsPromise;

  const project = await getProject(projectSlug);
  if (!project) {
    return buildNotFoundMetadata({
      title: "Project Not Found",
      description: "The requested project could not be found",
    });
  }
  const projectWithSeo = project as ProjectWithSeo;

  const description =
    projectWithSeo.seo?.description ||
    project.description ||
    `Posts and content from the ${project.name} project`;
  const title = projectWithSeo.seo?.title || project.name;
  const seoImage = getProjectSeoImage(projectWithSeo);

  return buildSeoMetadata({
    title,
    description,
    canonicalPath: projectRoute(projectSlug),
    keywords: [
      project.name,
      "project",
      "collection",
      "posts",
      "articles",
      "Lyóvson",
    ],
    image: seoImage?.url
      ? {
          url: absoluteUrl(seoImage.url),
          width: seoImage.width || undefined,
          height: seoImage.height || undefined,
          alt: title,
        }
      : {
          url: "/og-image.png",
          width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
          height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
          alt: title,
        },
  });
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("projects");
  cacheLife("static");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "projects",
    limit: 1000,
  });

  return ensureStaticParams(
    response.docs
      .filter(
        (doc): doc is Project =>
          typeof doc === "object" && "slug" in doc && !!doc.slug
      )
      .map(({ slug }) => ({
        project: slug as string,
      })),
    { project: "__placeholder__" }
  );
}
