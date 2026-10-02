import {
  activityUrl,
  lyovsonActivitiesPageRoute,
  lyovsonActivitiesRoute,
} from "@/utilities/routes";
import { createLyovsonFeedPage } from "../../../_utilities/create-lyovson-feed-page";

export const prefetch = "partial";

const feed = createLyovsonFeedPage({
  describe: (name, page) =>
    `Activities associated with ${name} on page ${page}.`,
  filter: "activities",
  getItemUrl: (item) =>
    item.type === "activity" ? activityUrl(item.data) : null,
  label: "Activities",
  routes: { index: lyovsonActivitiesRoute, page: lyovsonActivitiesPageRoute },
});

export const generateMetadata = feed.generateMetadata;
export const generateStaticParams = feed.generateStaticParams;
export default feed.Page;
