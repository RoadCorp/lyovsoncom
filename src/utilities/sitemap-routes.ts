import type { MetadataRoute } from "next";
import type {
  Activity,
  Lyovson,
  Note,
  Post,
  Project,
  Topic,
} from "@/payload-types";
import {
  ACTIVITIES_PER_PAGE,
  getIndexedPaginationPages,
  LYOVSON_ITEMS_PER_PAGE,
  NOTES_PER_PAGE,
  POSTS_PER_PAGE,
  PROJECT_POSTS_PER_PAGE,
  TOPIC_POSTS_PER_PAGE,
} from "@/utilities/archive";
import { getLyovsonFeedCounts } from "@/utilities/get-lyovson-feed";
import {
  absoluteUrl,
  activitiesPageRoute,
  activitiesRoute,
  activityUrl,
  lyovsonActivitiesPageRoute,
  lyovsonActivitiesRoute,
  lyovsonBioRoute,
  lyovsonContactRoute,
  lyovsonNotesPageRoute,
  lyovsonNotesRoute,
  lyovsonPageRoute,
  lyovsonPortfolioRoute,
  lyovsonPostsPageRoute,
  lyovsonPostsRoute,
  lyovsonRoute,
  notesPageRoute,
  notesRoute,
  noteUrl,
  postsPageRoute,
  postsRoute,
  postUrl,
  privacyPolicyRoute,
  projectPageRoute,
  projectsRoute,
  projectUrl,
  topicPageRoute,
  topicRoute,
  topicsRoute,
} from "@/utilities/routes";
import { getCanonicalSiteOrigin } from "@/utilities/site-config";

type Sitemap = MetadataRoute.Sitemap;
type ChangeFrequency = Sitemap[number]["changeFrequency"];

function sitemapEntry(
  url: string,
  lastModified: Date,
  changeFrequency: ChangeFrequency,
  priority: number
): Sitemap[number] {
  return { url, lastModified, changeFrequency, priority };
}

/** Indexable archive pages 2..N; page one is the archive route itself. */
function paginatedRoutes({
  changeFrequency = "weekly",
  lastModified,
  pageRoute,
  pageSize,
  priority,
  totalItems,
}: {
  changeFrequency?: ChangeFrequency;
  lastModified: Date;
  pageRoute: (pageNumber: number) => string;
  pageSize: number;
  priority: number;
  totalItems: number;
}): Sitemap {
  return getIndexedPaginationPages(totalItems, pageSize).map((pageNumber) =>
    sitemapEntry(
      absoluteUrl(pageRoute(pageNumber)),
      lastModified,
      changeFrequency,
      priority
    )
  );
}

export function getStaticRoutes(now: Date): Sitemap {
  return [
    // Homepage - highest priority. The bare origin (no trailing slash),
    // matching the layout canonical.
    sitemapEntry(getCanonicalSiteOrigin(), now, "daily", 1),
    // Main section pages - high priority
    sitemapEntry(absoluteUrl(postsRoute()), now, "daily", 0.9),
    sitemapEntry(absoluteUrl(notesRoute()), now, "daily", 0.9),
    sitemapEntry(absoluteUrl(activitiesRoute()), now, "daily", 0.9),
    sitemapEntry(absoluteUrl(projectsRoute()), now, "weekly", 0.9),
    sitemapEntry(absoluteUrl(topicsRoute()), now, "weekly", 0.8),
    // Utility pages - medium priority (About, AM and Contact are noindexed
    // placeholders and stay out until they have content)
    sitemapEntry(absoluteUrl(privacyPolicyRoute()), now, "yearly", 0.3),
    // AI and bot documentation - high priority for discovery
    sitemapEntry(absoluteUrl("/ai-docs"), now, "monthly", 0.8),
    // API endpoints stay out of the sitemap to prevent crawler-induced
    // database wake-ups; the API docs remain accessible.
  ];
}

function getSlugFromRelation(
  relation: unknown,
  idToSlugMap: Map<string, string>
) {
  if (typeof relation === "object" && relation !== null && "slug" in relation) {
    const slug = relation.slug;
    if (typeof slug === "string" && slug.length > 0) {
      return slug;
    }
  }

  if (typeof relation === "number" || typeof relation === "string") {
    return idToSlugMap.get(String(relation));
  }

  return null;
}

function getSlugsById(docs: (Project | Topic)[]) {
  const slugsById = new Map<string, string>();
  for (const doc of docs) {
    if (doc?.id && doc.slug) {
      slugsById.set(String(doc.id), doc.slug);
    }
  }
  return slugsById;
}

function increment(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) || 0) + 1);
}

/** Published post counts per project and topic slug, for archive pagination. */
function countPostsBySlug(posts: Post[], projects: Project[], topics: Topic[]) {
  const projectSlugById = getSlugsById(projects);
  const topicSlugById = getSlugsById(topics);
  const projectPostCounts = new Map<string, number>();
  const topicPostCounts = new Map<string, number>();

  for (const post of posts) {
    const projectSlug = getSlugFromRelation(post?.project, projectSlugById);
    if (projectSlug) {
      increment(projectPostCounts, projectSlug);
    }

    const topicRelations = Array.isArray(post?.topics) ? post.topics : [];
    for (const topicRelation of topicRelations) {
      const topicSlug = getSlugFromRelation(topicRelation, topicSlugById);
      if (topicSlug) {
        increment(topicPostCounts, topicSlug);
      }
    }
  }

  return { projectPostCounts, topicPostCounts };
}

function getPostRoutes(posts: Post[], now: Date): Sitemap {
  const routes: Sitemap = [];
  for (const post of posts) {
    if (post?.slug) {
      // Articles change less frequently after publication.
      routes.push(
        sitemapEntry(
          postUrl(post.slug),
          new Date(post.updatedAt),
          "monthly",
          0.8
        )
      );
    }
  }

  routes.push(
    ...paginatedRoutes({
      pageRoute: postsPageRoute,
      totalItems: posts.length,
      pageSize: POSTS_PER_PAGE,
      lastModified: now,
      priority: 0.6,
    })
  );
  return routes;
}

function getProjectRoutes(
  projects: Project[],
  postCounts: Map<string, number>
): Sitemap {
  return projects.flatMap((project) => {
    if (!project?.slug) {
      return [];
    }
    const { slug } = project;
    const lastModified = new Date(project.updatedAt);

    return [
      sitemapEntry(projectUrl(slug), lastModified, "weekly", 0.9),
      ...paginatedRoutes({
        pageRoute: (pageNumber) => projectPageRoute(slug, pageNumber),
        totalItems: postCounts.get(slug) || 0,
        pageSize: PROJECT_POSTS_PER_PAGE,
        lastModified,
        priority: 0.6,
      }),
    ];
  });
}

function getTopicRoutes(
  topics: Topic[],
  postCounts: Map<string, number>
): Sitemap {
  return topics.flatMap((topic) => {
    if (!topic?.slug) {
      return [];
    }
    const { slug } = topic;
    const lastModified = new Date(topic.updatedAt);

    return [
      sitemapEntry(absoluteUrl(topicRoute(slug)), lastModified, "monthly", 0.7),
      ...paginatedRoutes({
        pageRoute: (pageNumber) => topicPageRoute(slug, pageNumber),
        totalItems: postCounts.get(slug) || 0,
        pageSize: TOPIC_POSTS_PER_PAGE,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ];
  });
}

function getNoteRoutes(notes: Note[], now: Date): Sitemap {
  const routes: Sitemap = [];
  for (const note of notes) {
    if (note?.slug) {
      routes.push(
        sitemapEntry(
          noteUrl(note.slug),
          new Date(note.updatedAt),
          "monthly",
          0.8
        )
      );
    }
  }

  routes.push(
    ...paginatedRoutes({
      pageRoute: notesPageRoute,
      totalItems: notes.length,
      pageSize: NOTES_PER_PAGE,
      lastModified: now,
      priority: 0.6,
    })
  );
  return routes;
}

function getActivityRoutes(activities: Activity[], now: Date): Sitemap {
  const routes: Sitemap = [];
  for (const activity of activities) {
    const url = activity ? activityUrl(activity) : null;
    if (url) {
      routes.push(
        sitemapEntry(url, new Date(activity.updatedAt), "weekly", 0.8)
      );
    }
  }

  routes.push(
    ...paginatedRoutes({
      pageRoute: activitiesPageRoute,
      totalItems: activities.length,
      pageSize: ACTIVITIES_PER_PAGE,
      lastModified: now,
      priority: 0.6,
    })
  );
  return routes;
}

async function getLyovsonRoutes(
  username: string,
  lastModified: Date
): Promise<Sitemap> {
  const counts = await getLyovsonFeedCounts(username);
  const archives: [(pageNumber: number) => string, number, number][] = [
    // /{username}/page/N paginates posts, not the mixed feed.
    [
      (pageNumber) => lyovsonPageRoute(username, pageNumber),
      counts?.posts || 0,
      0.65,
    ],
    [
      (pageNumber) => lyovsonPostsPageRoute(username, pageNumber),
      counts?.posts || 0,
      0.55,
    ],
    [
      (pageNumber) => lyovsonNotesPageRoute(username, pageNumber),
      counts?.notes || 0,
      0.55,
    ],
    [
      (pageNumber) => lyovsonActivitiesPageRoute(username, pageNumber),
      counts?.activities || 0,
      0.55,
    ],
  ];

  return [
    sitemapEntry(
      absoluteUrl(lyovsonRoute(username)),
      lastModified,
      "weekly",
      0.8
    ),
    sitemapEntry(
      absoluteUrl(lyovsonBioRoute(username)),
      lastModified,
      "monthly",
      0.7
    ),
    sitemapEntry(
      absoluteUrl(lyovsonPortfolioRoute(username)),
      lastModified,
      "weekly",
      0.7
    ),
    sitemapEntry(
      absoluteUrl(lyovsonContactRoute(username)),
      lastModified,
      "monthly",
      0.6
    ),
    sitemapEntry(
      absoluteUrl(lyovsonPostsRoute(username)),
      lastModified,
      "weekly",
      0.75
    ),
    sitemapEntry(
      absoluteUrl(lyovsonNotesRoute(username)),
      lastModified,
      "weekly",
      0.75
    ),
    sitemapEntry(
      absoluteUrl(lyovsonActivitiesRoute(username)),
      lastModified,
      "weekly",
      0.75
    ),
    ...archives.flatMap(([pageRoute, totalItems, priority]) =>
      paginatedRoutes({
        pageRoute,
        totalItems,
        pageSize: LYOVSON_ITEMS_PER_PAGE,
        lastModified,
        priority,
      })
    ),
  ];
}

/** Author pages discovered from the CMS. */
async function getAllLyovsonRoutes(
  lyovsons: Lyovson[],
  now: Date
): Promise<Sitemap> {
  const routeGroups = await Promise.all(
    lyovsons
      .filter((lyovson) => Boolean(lyovson?.username))
      .map((lyovson) =>
        getLyovsonRoutes(
          lyovson.username,
          lyovson.updatedAt ? new Date(lyovson.updatedAt) : now
        )
      )
  );
  return routeGroups.flat();
}

export async function getContentRoutes(
  {
    activities,
    lyovsons,
    notes,
    posts,
    projects,
    topics,
  }: {
    activities: Activity[];
    lyovsons: Lyovson[];
    notes: Note[];
    posts: Post[];
    projects: Project[];
    topics: Topic[];
  },
  now: Date
): Promise<Sitemap> {
  const { projectPostCounts, topicPostCounts } = countPostsBySlug(
    posts,
    projects,
    topics
  );

  return [
    ...getPostRoutes(posts, now),
    ...getProjectRoutes(projects, projectPostCounts),
    ...getTopicRoutes(topics, topicPostCounts),
    ...getNoteRoutes(notes, now),
    ...getActivityRoutes(activities, now),
    ...(await getAllLyovsonRoutes(lyovsons, now)),
  ];
}
