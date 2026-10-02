import {
  lyovsonNotesPageRoute,
  lyovsonNotesRoute,
  noteUrl,
} from "@/utilities/routes";
import { createLyovsonFeedPage } from "../../../_utilities/create-lyovson-feed-page";

export const prefetch = "partial";

const feed = createLyovsonFeedPage({
  describe: (name, page) => `Public notes by ${name} on page ${page}.`,
  filter: "notes",
  getItemUrl: (item) =>
    item.type === "note" && item.data.slug ? noteUrl(item.data.slug) : null,
  label: "Notes",
  routes: { index: lyovsonNotesRoute, page: lyovsonNotesPageRoute },
});

export const generateMetadata = feed.generateMetadata;
export const generateStaticParams = feed.generateStaticParams;
export default feed.Page;
