import { CollectionArchive } from "@/components/CollectionArchive";
import { POSTS_PER_PAGE } from "@/utilities/archive";
import { createPaginatedArchivePage } from "@/utilities/create-paginated-archive-page";
import { getPaginatedPosts } from "@/utilities/get-post";
import { homepageRoute, homeRoute, postUrl } from "@/utilities/routes";

export const prefetch = "partial";

const archive = createPaginatedArchivePage({
  collection: "posts",
  copy: {
    heading: "Lyóvson.com - Latest Posts",
    metaDescription: (page) =>
      `Latest posts archive page ${page} from Lyovson.com.`,
    metaTitle: (page) => `Latest Posts - Page ${page}`,
    schemaDescription: (page) => `Latest posts archive page ${page}.`,
    schemaName: "Latest Posts",
  },
  extraCacheTags: ["homepage"],
  getItemUrl: (post) => (post.slug ? postUrl(post.slug) : null),
  getPage: getPaginatedPosts,
  perPage: POSTS_PER_PAGE,
  renderItems: (posts) => <CollectionArchive posts={posts} />,
  routes: { index: homeRoute, page: homepageRoute },
  seo: {
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Latest Posts",
    },
    keywords: [
      "latest posts",
      "articles",
      "Rafa Lyóvson",
      "Jess Lyóvson",
      "programming",
      "writing",
      "design",
      "philosophy",
      "research",
      "projects",
      "technology",
      "blog",
    ],
  },
  withActivitiesPreview: true,
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
