import { CollectionArchive } from "@/components/CollectionArchive";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import { createPaginatedArchivePage } from "@/utilities/create-paginated-archive-page";
import { getPaginatedPosts } from "@/utilities/get-post";
import { postsPageRoute, postsRoute, postUrl } from "@/utilities/routes";

export const prefetch = "partial";

const archive = createPaginatedArchivePage({
  collection: "posts",
  copy: {
    heading: "All Posts",
    metaDescription: (page) =>
      `Posts and articles from Lyovson.com - Page ${page}. Continue browsing our content on programming, design, and technology.`,
    metaTitle: (page) => `Posts Page ${page}`,
    schemaDescription: (page) =>
      `Archive of posts and articles on page ${page}.`,
    schemaName: "All Posts",
  },
  getItemUrl: (post) => (post.slug ? postUrl(post.slug) : null),
  getPage: getPaginatedPosts,
  perPage: POSTS_PER_PAGE,
  renderItems: (posts) => <CollectionArchive posts={posts} />,
  routes: { index: postsRoute, page: postsPageRoute },
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
