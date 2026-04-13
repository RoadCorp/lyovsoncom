import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { CollectionArchive } from "@/components/CollectionArchive";
import { SkeletonGrid } from "@/components/grid/skeleton";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getProject } from "@/utilities/get-project";
import { getPaginatedProjectPosts } from "@/utilities/get-project-posts";
import { getServerSideURL } from "@/utilities/getURL";

// Number of posts per page for pagination
const POSTS_PER_PAGE = 25;
const MAX_INDEXED_PAGE = 3;

interface Args {
  params: Promise<{
    project: string;
    pageNumber: string;
  }>;
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { project: projectSlug, pageNumber } = await paramsPromise;

  // Add cache tags for this specific project page
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${projectSlug}`);
  cacheTag(`project-${projectSlug}-page-${pageNumber}`);
  cacheLife("posts");

  const project = await getProject(projectSlug);
  if (!project) {
    return notFound();
  }

  const sanitizedPageNumber = Number(pageNumber);
  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) {
    return notFound();
  }
  if (sanitizedPageNumber === 1) {
    redirect(`/projects/${projectSlug}`);
  }

  const postsResponse = await getPaginatedProjectPosts(
    projectSlug,
    sanitizedPageNumber,
    POSTS_PER_PAGE
  );

  if (!postsResponse) {
    return notFound();
  }

  const { docs: posts, totalPages, page } = postsResponse;
  const projectName = project.name || projectSlug;
  const collectionPageSchema = generateCollectionPageSchema({
    name: `${projectName} - Page ${sanitizedPageNumber}`,
    description:
      project.description ||
      `Archive of ${projectName} posts on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/projects/${projectSlug}/page/${sanitizedPageNumber}`,
    itemCount: postsResponse.totalDocs,
    items: posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${getServerSideURL()}/posts/${post.slug}`,
      })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        <CollectionArchive posts={posts} />
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
}: Args): Promise<Metadata> {
  "use cache";

  const { project: projectSlug, pageNumber } = await paramsPromise;

  // Add cache tags for metadata
  cacheTag("projects");
  cacheTag(`project-${projectSlug}`);
  cacheLife("static"); // Project metadata changes less frequently

  const project = await getProject(projectSlug);
  if (!project) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Project Not Found | Lyovson.com",
      description: "The requested project could not be found",
    };
  }

  const projectName = project.name || projectSlug;
  const sanitizedPageNumber = Number(pageNumber);
  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 2) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `${projectName} Posts Page ${pageNumber} | Lyovson.com`,
    description: project.description || `Posts from ${projectName}`,
    alternates: {
      canonical: `/projects/${projectSlug}/page/${sanitizedPageNumber}`,
      ...(sanitizedPageNumber > 1 && {
        prev:
          sanitizedPageNumber === 2
            ? `/projects/${projectSlug}`
            : `/projects/${projectSlug}/page/${sanitizedPageNumber - 1}`,
      }),
    },
    openGraph: {
      title: `${projectName} Posts Page ${pageNumber} | Lyovson.com`,
      description: project.description || `Posts from ${projectName}`,
      type: "website",
      url: `/projects/${projectSlug}/page/${sanitizedPageNumber}`,
    },
    twitter: {
      card: "summary",
      title: `${projectName} Posts Page ${pageNumber} | Lyovson.com`,
      description: project.description || `Posts from ${projectName}`,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("projects");
  cacheLife("static"); // Build-time data doesn't change often

  // Could be enhanced with centralized utility in the future
  const configPromise = (await import("@payload-config")).default;
  const { getPayload } = await import("payload");

  const payload = await getPayload({ config: configPromise });
  const projects = await payload.find({
    collection: "projects",
    limit: 1000,
  });

  const paths: { project: string; pageNumber: string }[] = [];
  let fallbackProject: string | null = null;

  for (const project of projects.docs) {
    if (typeof project === "object" && "slug" in project && project.slug) {
      fallbackProject ??= project.slug as string;
      const postsResponse = await getPaginatedProjectPosts(
        project.slug as string,
        1,
        POSTS_PER_PAGE
      );

      const totalPages = postsResponse?.totalPages || 0;
      for (let i = 2; i <= totalPages; i++) {
        paths.push({
          project: project.slug as string,
          pageNumber: String(i),
        });
      }
    }
  }

  return ensureStaticParams(paths, {
    project: fallbackProject || "__placeholder__",
    pageNumber: fallbackProject ? "1" : "__placeholder__",
  });
}
