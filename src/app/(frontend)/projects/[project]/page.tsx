import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { GridCardProjectHero } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import type { Project } from "@/payload-types";
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

interface PageProps {
  params: Promise<{
    project: string;
  }>;
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
    return {
      title: "Project Not Found | Lyóvson.com",
      description: "The requested project could not be found",
    };
  }

  const description =
    project.description || `Posts and content from the ${project.name} project`;

  return {
    title: `${project.name} | Lyóvson.com`,
    description,
    keywords: [
      project.name,
      "project",
      "collection",
      "posts",
      "articles",
      "Lyóvson",
    ],
    alternates: {
      canonical: projectRoute(projectSlug),
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title: `${project.name} | Lyóvson.com`,
      description,
      type: "website",
      url: projectRoute(projectSlug),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${project.name} | Lyóvson.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Lyóvson.com`,
      description,
      site: "@lyovson",
      creator: "@lyovson",
      images: [
        {
          url: "/og-image.png",
          alt: `${project.name} | Lyóvson.com`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
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
