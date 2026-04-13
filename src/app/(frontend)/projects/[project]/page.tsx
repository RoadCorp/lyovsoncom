import configPromise from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { getPayload } from "payload";
import { Suspense } from "react";
import { CollectionArchive } from "@/components/CollectionArchive";
import { SkeletonGrid } from "@/components/grid/skeleton";
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
import { getServerSideURL } from "@/utilities/getURL";

interface PageProps {
  params: Promise<{
    project: string;
  }>;
}

export default async function Page({ params: paramsPromise }: PageProps) {
  "use cache";

  const { project: projectSlug } = await paramsPromise;

  // Add cache tags for this project
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${projectSlug}`);
  cacheLife("posts");

  const project = await getProject(projectSlug);

  if (!project) {
    return notFound();
  }

  const response = await getProjectPosts(projectSlug);

  if (!response) {
    return notFound();
  }

  const { docs, totalPages, page } = response;
  const collectionPageSchema = generateCollectionPageSchema({
    name: project.name,
    description: project.description || `Posts from ${project.name}`,
    url: `${getServerSideURL()}/projects/${projectSlug}`,
    itemCount: response.totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${getServerSideURL()}/posts/${post.slug}`,
      })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: getServerSideURL() },
    { name: "Projects", url: `${getServerSideURL()}/projects` },
    { name: project.name },
  ]);

  return (
    <>
      <h1 className="sr-only">{project.name}</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        <CollectionArchive posts={docs} />
      </Suspense>
      {totalPages > 1 && page && (
        <Pagination
          basePath={`/projects/${projectSlug}/page`}
          firstPagePath={`/projects/${projectSlug}`}
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: PageProps): Promise<Metadata> {
  "use cache";

  const { project: projectSlug } = await paramsPromise;

  // Add cache tags for metadata
  cacheTag("projects");
  cacheTag(`project-${projectSlug}`);
  cacheLife("static"); // Project metadata changes less frequently

  const project = await getProject(projectSlug);

  if (!project) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Project Not Found | Lyóvson.com",
      description: "The requested project could not be found",
    };
  }

  const description =
    project.description || `Posts and content from the ${project.name} project`;

  return {
    metadataBase: new URL(getServerSideURL()),
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
      canonical: `/projects/${projectSlug}`,
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title: `${project.name} | Lyóvson.com`,
      description,
      type: "website",
      url: `/projects/${projectSlug}`,
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
  cacheLife("static"); // Build-time data doesn't change often

  const payload = await getPayload({ config: configPromise });
  const response = await payload.find({
    collection: "projects",
    limit: 1000,
  });

  const { docs } = response;

  return ensureStaticParams(
    docs
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
