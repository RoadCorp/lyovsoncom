import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  PROJECT_POSTS_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getProject } from "@/utilities/get-project";
import {
  getPaginatedProjectPosts,
  getProjectPostCount,
} from "@/utilities/get-project-posts";
import { getPayloadClient } from "@/utilities/payload-client";
import {
  absoluteUrl,
  postRoute,
  projectPageRoute,
  projectRoute,
} from "@/utilities/routes";

interface Args {
  params: Promise<{
    pageNumber: string;
    project: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("projects");
  cacheLife("static");

  const payload = await getPayloadClient();
  const projects = await payload.find({
    collection: "projects",
    limit: 1000,
  });

  const paths: { pageNumber: string; project: string }[] = [];
  let fallbackProject: string | null = null;

  for (const project of projects.docs) {
    if (!(typeof project === "object" && "slug" in project && project.slug)) {
      continue;
    }

    const projectSlug = project.slug as string;
    fallbackProject ??= projectSlug;

    const totalPosts = await getProjectPostCount(projectSlug);
    for (const pageNumber of getPaginatedStaticParams(
      totalPosts ?? 0,
      PROJECT_POSTS_PER_PAGE
    )) {
      paths.push({
        project: projectSlug,
        pageNumber,
      });
    }
  }

  return ensureStaticParams(paths, {
    project: fallbackProject || "__placeholder__",
    pageNumber: "__placeholder__",
  });
}

export default async function Page({ params: paramsPromise }: Args) {
  const { project: projectSlug, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    return notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(projectRoute(projectSlug));
  }

  const project = await getProject(projectSlug);
  if (!project) {
    return notFound();
  }

  const postsResponse = await getPaginatedProjectPosts(
    projectSlug,
    sanitizedPageNumber,
    PROJECT_POSTS_PER_PAGE
  );

  if (!postsResponse) {
    return notFound();
  }

  const { docs: posts, page, totalPages } = postsResponse;
  const projectName = project.name || projectSlug;
  const currentPageRoute = projectPageRoute(projectSlug, sanitizedPageNumber);

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${projectName} - Page ${sanitizedPageNumber}`,
    description:
      project.description ||
      `Archive of ${projectName} posts on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(currentPageRoute),
    itemCount: postsResponse.totalDocs,
    items: posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: absoluteUrl(postRoute(post.slug as string)),
      })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={posts} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumberValue) =>
            projectPageRoute(projectSlug, pageNumberValue)
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
}: Args): Promise<Metadata> {
  const { project: projectSlug, pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  const project = await getProject(projectSlug);
  if (!project) {
    return {
      title: "Project Not Found | Lyovson.com",
      description: "The requested project could not be found",
    };
  }

  const projectName = project.name || projectSlug;
  const title = `${projectName} Posts Page ${sanitizedPageNumber} | Lyovson.com`;
  const description = project.description || `Posts from ${projectName}`;

  return {
    title,
    description,
    alternates: {
      canonical: projectPageRoute(projectSlug, sanitizedPageNumber),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(projectPageRoute(projectSlug, sanitizedPageNumber)),
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
