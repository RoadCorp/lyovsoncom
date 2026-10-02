import { GridCardProjectHero } from "@/components/grid/card/project";
import { PROJECT_POSTS_PER_PAGE } from "@/utilities/archive";
import { createEntityArchivePage } from "@/utilities/create-entity-archive-page";
import { getProject } from "@/utilities/get-project";
import { getPaginatedProjectPosts } from "@/utilities/get-project-posts";
import { projectPageRoute, projectRoute } from "@/utilities/routes";

export const prefetch = "partial";

const archive = createEntityArchivePage({
  copy: {
    metaDescription: (name) => `Posts from ${name}`,
    metaTitle: (name, page) => `${name} Posts Page ${page}`,
    notFound: {
      title: "Project Not Found",
      description: "The requested project could not be found",
    },
    schemaDescription: (name, page) =>
      `Archive of ${name} posts on page ${page}.`,
  },
  entity: "projects",
  getEntity: getProject,
  getPage: getPaginatedProjectPosts,
  param: "project",
  perPage: PROJECT_POSTS_PER_PAGE,
  renderPage: ({ entity, jsonLd, name, pagination, posts }) => (
    <>
      {jsonLd}
      <h1 className="sr-only">{name}</h1>
      <GridCardProjectHero project={entity} />
      {posts}
      {pagination}
    </>
  ),
  routes: { index: projectRoute, page: projectPageRoute },
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
