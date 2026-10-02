import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { ACTIVITIES_PER_PAGE } from "@/utilities/archive";
import { createPaginatedArchivePage } from "@/utilities/create-paginated-archive-page";
import { getPaginatedActivities } from "@/utilities/get-activity";
import {
  activitiesPageRoute,
  activitiesRoute,
  activityUrl,
} from "@/utilities/routes";

export const prefetch = "partial";

const archive = createPaginatedArchivePage({
  collection: "activities",
  copy: {
    heading: "All Activities",
    metaDescription: (page) => `Browse activities - Page ${page}`,
    metaTitle: (page) => `Activities & Consumption - Page ${page}`,
    schemaDescription: (page) =>
      `Archive of activities and media logs on page ${page}.`,
    schemaName: "Activities",
  },
  getItemUrl: activityUrl,
  getPage: getPaginatedActivities,
  perPage: ACTIVITIES_PER_PAGE,
  renderItems: (activities) => <ActivitiesArchive activities={activities} />,
  routes: { index: activitiesRoute, page: activitiesPageRoute },
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
