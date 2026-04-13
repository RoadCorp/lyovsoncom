import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Activity, Lyovson, Note, Post, Project } from "@/payload-types";
import {
  getNoteAuthorByUsername,
  lyovsonActivitiesWhere,
  lyovsonNotesWhere,
  lyovsonPostsWhere,
} from "@/utilities/content-queries";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import type { MixedFeedItem } from "@/utilities/mixed-feed";
import {
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
  user: Lyovson;
}

export interface LyovsonPortfolioResponse {
  projects: Project[];
  user: Lyovson;
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

function getEmptyPaginatedResponse<T>(
  page: number,
  limit: number
): PaginatedDocs<T> {
  return {
    docs: [],
    hasNextPage: false,
    hasPrevPage: page > 1,
    limit,
    nextPage: null,
    page,
    pagingCounter: (page - 1) * limit + 1,
    prevPage: page > 1 ? page - 1 : null,
    totalDocs: 0,
    totalPages: 1,
  };
}

async function getLyovsonPostsPaginated(
  lyovsonId: number,
  page: number,
  limit: number
): Promise<PaginatedDocs<Post>> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    page,
    where: lyovsonPostsWhere(lyovsonId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

async function getLyovsonPostsForMixedFeed(
  lyovsonId: number,
  limit: number
): Promise<PaginatedDocs<Post>> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    where: lyovsonPostsWhere(lyovsonId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

async function getLyovsonNotesPaginated(
  username: string,
  page: number,
  limit: number
): Promise<PaginatedDocs<Note>> {
  const noteAuthor = getNoteAuthorByUsername(username);
  if (!noteAuthor) {
    return getEmptyPaginatedResponse<Note>(page, limit);
  }

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "notes",
    depth: 2,
    limit,
    page,
    where: lyovsonNotesWhere(username) ?? undefined,
    sort: "-publishedAt",
    overrideAccess: false,
  });

  return {
    ...result,
    docs: result.docs as Note[],
  };
}

async function getLyovsonNotesForMixedFeed(
  username: string,
  limit: number
): Promise<PaginatedDocs<Note>> {
  const noteAuthor = getNoteAuthorByUsername(username);
  if (!noteAuthor) {
    return getEmptyPaginatedResponse<Note>(1, limit);
  }

  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "notes",
    depth: 2,
    limit,
    where: lyovsonNotesWhere(username) ?? undefined,
    sort: "-publishedAt",
    overrideAccess: false,
  });

  return {
    ...result,
    docs: result.docs as Note[],
  };
}

async function getLyovsonActivitiesPaginated(
  lyovsonId: number,
  page: number,
  limit: number
): Promise<PaginatedDocs<Activity>> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "activities",
    depth: 2,
    limit,
    page,
    where: lyovsonActivitiesWhere(lyovsonId),
    sort: "-finishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Activity[],
  };
}

async function getLyovsonActivitiesForMixedFeed(
  lyovsonId: number,
  limit: number
): Promise<PaginatedDocs<Activity>> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "activities",
    depth: 2,
    limit,
    where: lyovsonActivitiesWhere(lyovsonId),
    sort: "-finishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Activity[],
  };
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

  if (filter === "posts") {
    const postResults = await getLyovsonPostsPaginated(
      user.id,
      safePage,
      safeLimit
    );
    const totalPages = getTotalPages(postResults.totalDocs, safeLimit);

    return {
      user,
      items: mapPostsToMixedFeedItems(postResults.docs as Post[]),
      page: safePage,
      totalItems: postResults.totalDocs,
      totalPages,
    };
  }

  if (filter === "notes") {
    const noteResults = await getLyovsonNotesPaginated(
      username,
      safePage,
      safeLimit
    );
    const totalPages = getTotalPages(noteResults.totalDocs, safeLimit);

    return {
      user,
      items: mapNotesToMixedFeedItems(noteResults.docs as Note[]),
      page: safePage,
      totalItems: noteResults.totalDocs,
      totalPages,
    };
  }

  if (filter === "activities") {
    const activityResults = await getLyovsonActivitiesPaginated(
      user.id,
      safePage,
      safeLimit
    );
    const totalPages = getTotalPages(activityResults.totalDocs, safeLimit);

    return {
      user,
      items: mapActivitiesToMixedFeedItems(activityResults.docs as Activity[]),
      page: safePage,
      totalItems: activityResults.totalDocs,
      totalPages,
    };
  }

  const mixedFetchLimit = safePage * safeLimit + FETCH_BUFFER;

  const [posts, notes, activities] = await Promise.all([
    getLyovsonPostsForMixedFeed(user.id, mixedFetchLimit),
    getLyovsonNotesForMixedFeed(username, mixedFetchLimit),
    getLyovsonActivitiesForMixedFeed(user.id, mixedFetchLimit),
  ]);

  const mixedItems = sortMixedFeedItems([
    ...mapPostsToMixedFeedItems(posts.docs as Post[]),
    ...mapNotesToMixedFeedItems(notes.docs as Note[]),
    ...mapActivitiesToMixedFeedItems(activities.docs as Activity[]),
  ]);

  const totalItems = posts.totalDocs + notes.totalDocs + activities.totalDocs;
  const totalPages = getTotalPages(totalItems, safeLimit);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;

  return {
    user,
    items: mixedItems.slice(startIndex, endIndex),
    page: safePage,
    totalItems,
    totalPages,
  };
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

  const payload = await getPayloadClient();
  const [posts, notes, activities] = await Promise.all([
    payload.count({
      collection: "posts",
      overrideAccess: true,
      where: lyovsonPostsWhere(user.id),
    }),
    payload.count({
      collection: "notes",
      overrideAccess: false,
      where: lyovsonNotesWhere(username) ?? undefined,
    }),
    payload.count({
      collection: "activities",
      overrideAccess: true,
      where: lyovsonActivitiesWhere(user.id),
    }),
  ]);

  return {
    posts: posts.totalDocs,
    notes: notes.totalDocs,
    activities: activities.totalDocs,
    all: posts.totalDocs + notes.totalDocs + activities.totalDocs,
  };
}

export async function getLyovsonPortfolioProjects(
  username: string
): Promise<LyovsonPortfolioResponse | null> {
  "use cache";

  cacheTag("posts");
  cacheTag("projects");
  cacheTag("lyovsons");
  cacheTag(`lyovson-${username}`);
  cacheTag(`lyovson-${username}-portfolio`);
  cacheLife("posts");

  const user = await getLyovsonProfile(username);
  if (!user) {
    return null;
  }

  const payload = await getPayloadClient();

  const posts = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 500,
    where: {
      AND: [
        lyovsonPostsWhere(user.id),
        {
          project: {
            exists: true,
          },
        },
      ],
    },
    sort: "-publishedAt",
    overrideAccess: true,
  });

  const uniqueProjects = new Map<string, Project>();

  for (const post of posts.docs as Post[]) {
    if (!post.project || typeof post.project !== "object") {
      continue;
    }

    const project = post.project as Project;
    const projectId = String(project.id);

    if (!uniqueProjects.has(projectId)) {
      uniqueProjects.set(projectId, project);
    }
  }

  return {
    user,
    projects: [...uniqueProjects.values()],
  };
}
