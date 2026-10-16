import { PublicPageBoundary } from "@/components/public-page-boundary";
export const prefetch = "partial";

import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import { GridCardProjectHero } from "@/components/grid";
import {
  GridCardProjectFacts,
  GridCardProjectHighlights,
  GridCardProjectStack,
  GridCardRelatedProjects,
  ProjectCaseStudy,
  ProjectGallery,
} from "@/components/grid/card/project/details";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";
import type { Lyovson, Media, Project } from "@/payload-types";
import { publishedProjectsWhere } from "@/utilities/content-queries";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getProject } from "@/utilities/get-project";
import { getProjectPosts } from "@/utilities/get-project-posts";
import { getMoreWork } from "@/utilities/get-projects";
import { resolveHighlights } from "@/utilities/live-metrics";
import { getLyovsonPersonInput } from "@/utilities/lyovson-person";
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

function getCasePeople(project: Project) {
  return (project.people ?? []).filter(
    (person): person is Lyovson => typeof person === "object" && person !== null
  );
}

async function CaseStudyContent({
  project,
  posts,
}: {
  posts: NonNullable<Awaited<ReturnType<typeof getProjectPosts>>>;
  project: Project & { slug: string };
}) {
  const people = getCasePeople(project);
  const [moreWork, highlights] = await Promise.all([
    getMoreWork(
      project.id,
      people.map((person) => person.id)
    ),
    resolveHighlights(project.highlights ?? []),
  ]);
  const seoImage = getProjectSeoImage(project as ProjectWithSeo);
  const creators = people
    .map((person) => getLyovsonPersonInput(person))
    .filter((person) => person !== null);
  const sections = project.caseStudy ?? [];
  const gallery = project.gallery ?? [];
  const hasGallery = gallery.some(
    (item) => typeof item.image === "object" && item.image !== null
  );

  const articleSchema = generateArticleSchema({
    title: project.name,
    description: project.description || undefined,
    slug: project.slug,
    url: absoluteUrl(projectRoute(project.slug)),
    publishedAt: project.publishedAt || undefined,
    updatedAt: project.updatedAt || undefined,
    imageUrl: seoImage?.url ? absoluteUrl(seoImage.url) : undefined,
    imageWidth: seoImage?.width || undefined,
    imageHeight: seoImage?.height || undefined,
    authors: creators,
    keywords: project.stack ?? undefined,
    about: project.url
      ? {
          name: project.name,
          url: project.url,
          creators,
          dateCreated: project.startedAt || undefined,
          keywords: project.stack ?? undefined,
        }
      : undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Projects", url: absoluteUrl(projectsRoute()) },
    { name: project.name },
  ]);

  return (
    <>
      <h1 className="sr-only">{project.name}</h1>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardProjectHero project={project} />

      <ProjectCaseStudy
        className={cn(
          "g2:col-start-2 g2:col-end-3 g2:row-auto g2:row-start-3",
          "g3:col-end-4 g3:row-start-2 g3:w-[var(--grid-card-2x1)]"
        )}
        sections={sections}
      />

      {hasGallery ? (
        <ProjectGallery
          className={cn(
            "col-start-1 col-end-2 row-start-5",
            "g2:col-start-2 g2:col-end-3 g2:row-start-4",
            "g3:col-end-4 g3:row-start-3 g3:w-[var(--grid-card-2x1)]"
          )}
          items={gallery}
        />
      ) : null}

      <aside
        aria-label={`About ${project.name}`}
        className={cn(
          "col-start-1 col-end-2 grid auto-rows-max gap-4 self-start",
          hasGallery ? "row-start-6 row-end-7" : "row-start-5 row-end-6",
          "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5"
        )}
      >
        <GridCardProjectFacts project={project} />
        <GridCardProjectStack stack={project.stack ?? []} />
        <GridCardProjectHighlights highlights={highlights} />
        <GridCardRelatedProjects projects={moreWork} />
      </aside>

      {posts.docs.length > 0 ? <CollectionArchive posts={posts.docs} /> : null}
      {posts.totalPages > 1 && posts.page ? (
        <Pagination
          getPageHref={(pageNumber) =>
            projectPageRoute(project.slug, pageNumber)
          }
          page={posts.page}
          totalPages={posts.totalPages}
        />
      ) : null}
    </>
  );
}

async function PageContent({ params: paramsPromise }: PageProps) {
  const { project: projectSlug } = await paramsPromise;

  const project = await getProject(projectSlug);
  if (!project) {
    return notFound();
  }

  const response = await getProjectPosts(projectSlug);
  if (!response) {
    return notFound();
  }

  if (project.caseStudy?.length && project.slug) {
    return (
      <CaseStudyContent
        posts={response}
        project={project as Project & { slug: string }}
      />
    );
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

  const isCaseStudy = Boolean(project.caseStudy?.length);
  const description =
    projectWithSeo.seo?.description ||
    project.description ||
    (isCaseStudy
      ? `${project.name}: how it was designed and built`
      : `Posts and content from the ${project.name} project`);
  const title = projectWithSeo.seo?.title || project.name;
  const seoImage = getProjectSeoImage(projectWithSeo);

  return buildSeoMetadata({
    title,
    description,
    canonicalPath: projectRoute(projectSlug),
    keywords: isCaseStudy
      ? [project.name, "case study", ...(project.stack ?? []), "Lyóvson"]
      : [project.name, "project", "collection", "posts", "articles", "Lyóvson"],
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
    depth: 0,
    limit: 1000,
    select: { slug: true },
    where: publishedProjectsWhere(),
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

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
