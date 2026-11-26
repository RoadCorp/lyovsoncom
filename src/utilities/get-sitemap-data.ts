import { cacheLife, cacheTag } from "next/cache";
import type { Activity, Lyovson, Post, Project, Topic } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getSitemapData() {
  "use cache";
  cacheTag("sitemap");
  cacheTag("posts");
  cacheTag("projects");
  cacheTag("topics");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("sitemap");

  const payload = await getPayloadClient();

  const [posts, projects, topics, activities, lyovsons] = await Promise.all([
    payload.find({
      collection: "posts",
      overrideAccess: false,
      pagination: false,
      where: { _status: { equals: "published" } },
      depth: 1,
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        project: true,
        topics: true,
      },
    }),
    payload.find({
      collection: "projects",
      depth: 0,
      overrideAccess: false,
      pagination: false,
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        people: true,
      },
    }),
    payload.find({
      collection: "topics",
      depth: 0,
      overrideAccess: false,
      pagination: false,
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    }),
    payload.find({
      collection: "activities",
      depth: 0,
      overrideAccess: false,
      pagination: false,
      where: {
        _status: { equals: "published" },
        visibility: { equals: "public" },
      },
      select: {
        slug: true,
        updatedAt: true,
        finishedAt: true,
        startedAt: true,
        publishedAt: true,
      },
    }),
    payload.find({
      collection: "lyovsons",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      select: {
        username: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    posts: posts.docs as Post[],
    projects: projects.docs as Project[],
    topics: topics.docs as Topic[],
    activities: activities.docs as Activity[],
    lyovsons: lyovsons.docs as Lyovson[],
  };
}
