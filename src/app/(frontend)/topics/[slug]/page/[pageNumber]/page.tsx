import { TOPIC_POSTS_PER_PAGE } from "@/utilities/archive";
import { createEntityArchivePage } from "@/utilities/create-entity-archive-page";
import { getTopic } from "@/utilities/get-topic";
import { getPaginatedTopicPosts } from "@/utilities/get-topic-posts";
import { topicPageRoute, topicRoute } from "@/utilities/routes";

export const prefetch = "partial";

const archive = createEntityArchivePage({
  copy: {
    metaDescription: (name, page) => `Posts about ${name} - page ${page}`,
    metaTitle: (name, page) => `${name} - Page ${page}`,
    notFound: {
      title: "Topic Not Found",
      description: "The requested topic could not be found",
    },
    schemaDescription: (name, page) =>
      `Archive of posts about ${name} on page ${page}.`,
  },
  entity: "topics",
  getEntity: getTopic,
  getPage: getPaginatedTopicPosts,
  param: "slug",
  perPage: TOPIC_POSTS_PER_PAGE,
  renderPage: ({ jsonLd, name, pageNumber, pagination, posts }) => (
    <>
      <h1 className="sr-only">
        {name} - Page {pageNumber}
      </h1>
      {jsonLd}
      {posts}
      {pagination}
    </>
  ),
  routes: { index: topicRoute, page: topicPageRoute },
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
