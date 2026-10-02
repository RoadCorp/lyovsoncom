import { lyovsonPageRoute, lyovsonRoute, postUrl } from "@/utilities/routes";
import { createLyovsonFeedPage } from "../../_utilities/create-lyovson-feed-page";

export const prefetch = "partial";

const feed = createLyovsonFeedPage({
  describe: (name, page) => `Published posts by ${name} on page ${page}.`,
  filter: "posts",
  getItemUrl: (item) =>
    item.type === "post" && item.data.slug ? postUrl(item.data.slug) : null,
  label: "Posts",
  routes: { index: lyovsonRoute, page: lyovsonPageRoute },
  withActivitiesPreview: true,
});

export const generateMetadata = feed.generateMetadata;
export const generateStaticParams = feed.generateStaticParams;
export default feed.Page;
