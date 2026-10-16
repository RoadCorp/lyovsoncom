import { cacheLife, cacheTag } from "next/cache";
import { lyovsonPortfolioWhere } from "@/utilities/content-queries";
import {
  getLyovsonProfile,
  type PublicProfile,
} from "@/utilities/get-lyovson-profile";
import {
  type ProjectCardData,
  projectCardSelect,
} from "@/utilities/get-projects";
import {
  countLyovsonContent,
  findLyovsonActivities,
  findLyovsonNotes,
  findLyovsonPosts,
} from "@/utilities/lyovson-feed-queries";
import {
  type MixedFeedItem,
  mapActivitiesToMixedFeedItems,
  mapNotesToMixedFeedItems,
  mapPostsToMixedFeedItems,
  sortMixedFeedItems,
} from "@/utilities/mixed-feed";
import { getPayloadClient } from "@/utilities/payload-client";

export type LyovsonFilter = "all" | "posts" | "notes" | "activities";

export type LyovsonMixedFeedItem = MixedFeedItem;

export interface LyovsonFeedResponse {
  items: LyovsonMixedFeedItem[];
  page: number;
  totalItems: number;
  totalPages: number;
  user: PublicProfile;
}

export interface LyovsonPortfolioResponse {
  projects: ProjectCardData[];
  user: PublicProfile;
}

interface LyovsonFeedParams {
  filter?: LyovsonFilter;
  limit?: number;
  page?: number;
  username: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const FETCH_BUFFER = 5;

export interface LyovsonFeedCounts {
  activities: number;
  all: number;
  notes: number;
  posts: number;
}

function getValidPage(page: number | undefined): number {
  if (!(page && Number.isInteger(page)) || page < 1) {
    return DEFAULT_PAGE;
  }

  return page;
}

function getValidLimit(limit: number | undefined): number {
  if (!(limit && Number.isInteger(limit)) || limit < 1) {
    return DEFAULT_LIMIT;
  }

  return limit;
}

function getTotalPages(totalItems: number, limit: number): number {
  return Math.max(1, Math.ceil(totalItems / limit));
}

interface FeedPageArgs {
  limit: number;
  lyovsonId: number;
  page: number;
  username: string;
}

interface FeedPage {
  items: LyovsonMixedFeedItem[];
  totalItems: number;
}

/** Single-collection feeds paginate in the database. */
const singleCollectionFeeds: Record<
  Exclude<LyovsonFilter, "all">,
  (args: FeedPageArgs) => Promise<FeedPage>
> = {
  posts: async ({ limit, lyovsonId, page }) => {
    const result = await findLyovsonPosts(lyovsonId, limit, page);
    return {
      items: mapPostsToMixedFeedItems(result.docs),
      totalItems: result.totalDocs,
    };
  },
  notes: async ({ limit, page, username }) => {
    const result = await findLyovsonNotes(username, limit, page);
    return {
      items: mapNotesToMixedFeedItems(result.docs),
      totalItems: result.totalDocs,
    };
  },
  activities: async ({ limit, lyovsonId, page }) => {
    const result = await findLyovsonActivities(lyovsonId, limit, page);
    return {
      items: mapActivitiesToMixedFeedItems(result.docs),
      totalItems: result.totalDocs,
    };
  },
};

/**
 * The mixed feed reads the newest documents of each collection up to the
 * requested page, merges them by date and slices out the page.
 */
async function getMixedFeedItems(
  { limit, lyovsonId, page, username }: FeedPageArgs,
  totalItems: number
): Promise<LyovsonMixedFeedItem[]> {
  const fetchLimit = Math.min(page * limit + FETCH_BUFFER, totalItems || limit);

  const [posts, notes, activities] = await Promise.all([
    findLyovsonPosts(lyovsonId, fetchLimit),
    findLyovsonNotes(username, fetchLimit),
    findLyovsonActivities(lyovsonId, fetchLimit),
  ]);

  const mixedItems = sortMixedFeedItems([
    ...mapPostsToMixedFeedItems(posts.docs),
    ...mapNotesToMixedFeedItems(notes.docs),
    ...mapActivitiesToMixedFeedItems(activities.docs),
  ]);

  const startIndex = (page - 1) * limit;
  return mixedItems.slice(startIndex, startIndex + limit);
}

export async function getLyovsonFeed({
  username,
  filter = "all",
  page,
  limit,
}: LyovsonFeedParams): Promise<LyovsonFeedResponse | null> {
  "use cache";

  const safePage = getValidPage(page);
  const safeLimit = getValidLimit(limit);

  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-${filter}`);
  cacheTag(`lyovson-${username}-${filter}-page-${safePage}`);
  cacheLife("feed");

  const user = await getLyovsonProfile(username);
  if (!user) {
    return null;
  }

  const args: FeedPageArgs = {
    limit: safeLimit,
    lyovsonId: user.id,
    page: safePage,
    username,
  };

  if (filter !== "all") {
    const { items, totalItems } = await singleCollectionFeeds[filter](args);
    return {
      user,
      items,
      page: safePage,
      totalItems,
      totalPages: getTotalPages(totalItems, safeLimit),
    };
  }

  const counts = await getLyovsonFeedCounts(username);
  if (!counts) {
    return null;
  }
  const totalItems = counts.all;
  const totalPages = getTotalPages(totalItems, safeLimit);
  const items =
    safePage > totalPages ? [] : await getMixedFeedItems(args, totalItems);

  return { user, items, page: safePage, totalItems, totalPages };
}

export async function getLyovsonFeedCounts(
  username: string
): Promise<LyovsonFeedCounts | null> {
  "use cache";

  cacheTag("posts");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-counts`);
  cacheLife("static");

  const user = await getLyovsonProfile(username);
  if (!user) {
    return null;
  }

  const counts = await countLyovsonContent(user.id, username);

  return {
    ...counts,
    all: counts.posts + counts.notes + counts.activities,
  };
}

export async function getLyovsonPortfolioProjects(
  username: string
): Promise<LyovsonPortfolioResponse | null> {
  "use cache";

  cacheTag("projects");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-portfolio`);
  cacheLife("projects");

  const user = await getLyovsonProfile(username);
  if (!user) {
    return null;
  }

  const payload = await getPayloadClient();

  const projects = await payload.find({
    collection: "projects",
    depth: 1,
    pagination: false,
    select: projectCardSelect,
    // Postgres sorts missing dates first when descending; portfolio
    // projects require a start month, so publishedAt only breaks ties.
    sort: ["-startedAt", "-publishedAt"],
    where: lyovsonPortfolioWhere(user.id),
    overrideAccess: true,
  });

  return {
    user,
    projects: projects.docs,
  };
}
