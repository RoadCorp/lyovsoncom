import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getActivityPath } from "@/utilities/activity-path";
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
import { getSitemapData } from "@/utilities/get-sitemap-data";

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

function addLyovsonPaginatedRoutes({
  basePath,
  lastModified,
  pageSize,
  priority,
  routes,
  siteUrl,
  totalItems,
  username,
}: {
  basePath: string;
  lastModified: Date;
  pageSize: number;
  priority: number;
  routes: MetadataRoute.Sitemap;
  siteUrl: string;
  totalItems: number;
  username: string;
}) {
  for (const pageNumber of getIndexedPaginationPages(totalItems, pageSize)) {
    routes.push({
      url: `${siteUrl}/${username}${basePath}/page/${pageNumber}`,
      lastModified,
      changeFrequency: "weekly",
      priority,
    });
  }
}

async function getLyovsonRoutes({
  lastModified,
  siteUrl,
  username,
}: {
  lastModified: Date;
  siteUrl: string;
  username: string;
}): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/${username}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/${username}/bio`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/${username}/portfolio`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/${username}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/${username}/posts`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/${username}/notes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/${username}/activities`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];

  const counts = await getLyovsonFeedCounts(username);
  const totalMixedItems = counts?.all || 0;

  addLyovsonPaginatedRoutes({
    routes,
    siteUrl,
    username,
    basePath: "",
    totalItems: totalMixedItems,
    pageSize: LYOVSON_ITEMS_PER_PAGE,
    lastModified,
    priority: 0.65,
  });

  if (counts?.posts) {
    addLyovsonPaginatedRoutes({
      routes,
      siteUrl,
      username,
      basePath: "/posts",
      totalItems: counts.posts,
      pageSize: LYOVSON_ITEMS_PER_PAGE,
      lastModified,
      priority: 0.55,
    });
  }

  if (counts?.notes) {
    addLyovsonPaginatedRoutes({
      routes,
      siteUrl,
      username,
      basePath: "/notes",
      totalItems: counts.notes,
      pageSize: LYOVSON_ITEMS_PER_PAGE,
      lastModified,
      priority: 0.55,
    });
  }

  if (counts?.activities) {
    addLyovsonPaginatedRoutes({
      routes,
      siteUrl,
      username,
      basePath: "/activities",
      totalItems: counts.activities,
      pageSize: LYOVSON_ITEMS_PER_PAGE,
      lastModified,
      priority: 0.55,
    });
  }

  return routes;
}

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Sitemap generation aggregates multiple collections and routes */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheTag("sitemap");
  cacheTag("posts");
  cacheTag("projects");
  cacheTag("topics");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("sitemap");

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "https://www.lyovson.com";
  const now = new Date();

  const { posts, projects, topics, notes, activities, lyovsons } =
    await getSitemapData();

  const projectSlugById = new Map<string, string>();
  const topicSlugById = new Map<string, string>();
  const projectPostCounts = new Map<string, number>();
  const topicPostCounts = new Map<string, number>();

  for (const project of projects) {
    if (!(project?.id && project.slug)) {
      continue;
    }
    projectSlugById.set(String(project.id), project.slug);
  }

  for (const topic of topics) {
    if (!(topic?.id && topic.slug)) {
      continue;
    }
    topicSlugById.set(String(topic.id), topic.slug);
  }

  for (const post of posts) {
    const projectSlug = getSlugFromRelation(post?.project, projectSlugById);
    if (projectSlug) {
      projectPostCounts.set(
        projectSlug,
        (projectPostCounts.get(projectSlug) || 0) + 1
      );
    }

    if (!Array.isArray(post?.topics)) {
      continue;
    }

    for (const topicRelation of post.topics) {
      const topicSlug = getSlugFromRelation(topicRelation, topicSlugById);
      if (!topicSlug) {
        continue;
      }
      topicPostCounts.set(topicSlug, (topicPostCounts.get(topicSlug) || 0) + 1);
    }
  }

  const routes: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    // Main section pages - high priority
    {
      url: `${SITE_URL}/posts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/activities`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Utility pages - medium priority
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/am`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // AI and bot documentation - high priority for discovery
    {
      url: `${SITE_URL}/ai-docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/.well-known/ai-resources`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Note: API endpoints removed from sitemap to prevent crawler-induced database wake-ups
    // API docs are still accessible but not indexed as sitemap entries
  ];

  // Add posts with enhanced metadata
  for (const post of posts) {
    if (!post?.slug) {
      continue;
    }

    routes.push({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly", // Articles change less frequently after publication
      priority: 0.8,
    });
  }

  // Add paginated archive pages that are indexable
  for (const pageNumber of getIndexedPaginationPages(
    posts.length,
    POSTS_PER_PAGE
  )) {
    routes.push({
      url: `${SITE_URL}/posts/page/${pageNumber}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Add projects with better change frequency
  for (const project of projects) {
    if (!project?.slug) {
      continue;
    }

    routes.push({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    const projectPostCount = projectPostCounts.get(project.slug) || 0;
    for (const pageNumber of getIndexedPaginationPages(
      projectPostCount,
      PROJECT_POSTS_PER_PAGE
    )) {
      routes.push({
        url: `${SITE_URL}/projects/${project.slug}/page/${pageNumber}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Add topics with appropriate priority
  for (const topic of topics) {
    if (!topic?.slug) {
      continue;
    }

    routes.push({
      url: `${SITE_URL}/topics/${topic.slug}`,
      lastModified: new Date(topic.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });

    const topicPostCount = topicPostCounts.get(topic.slug) || 0;
    for (const pageNumber of getIndexedPaginationPages(
      topicPostCount,
      TOPIC_POSTS_PER_PAGE
    )) {
      routes.push({
        url: `${SITE_URL}/topics/${topic.slug}/page/${pageNumber}`,
        lastModified: new Date(topic.updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  // Add notes
  for (const note of notes) {
    if (!note?.slug) {
      continue;
    }

    routes.push({
      url: `${SITE_URL}/notes/${note.slug}`,
      lastModified: new Date(note.updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const pageNumber of getIndexedPaginationPages(
    notes.length,
    NOTES_PER_PAGE
  )) {
    routes.push({
      url: `${SITE_URL}/notes/page/${pageNumber}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Add activities
  for (const activity of activities) {
    if (!activity?.slug) {
      continue;
    }

    const activityPath = getActivityPath(activity);
    if (!activityPath) {
      continue;
    }

    routes.push({
      url: `${SITE_URL}${activityPath}`,
      lastModified: new Date(activity.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const pageNumber of getIndexedPaginationPages(
    activities.length,
    ACTIVITIES_PER_PAGE
  )) {
    routes.push({
      url: `${SITE_URL}/activities/page/${pageNumber}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Add author pages discovered from the CMS
  const lyovsonRouteGroups = await Promise.all(
    lyovsons
      .filter((lyovson) => Boolean(lyovson?.username))
      .map((lyovson) => {
        const username = lyovson.username;
        const lastModified = lyovson.updatedAt
          ? new Date(lyovson.updatedAt)
          : now;
        return getLyovsonRoutes({
          siteUrl: SITE_URL,
          username,
          lastModified,
        });
      })
  );

  for (const lyovsonRoutes of lyovsonRouteGroups) {
    routes.push(...lyovsonRoutes);
  }

  return routes;
}
