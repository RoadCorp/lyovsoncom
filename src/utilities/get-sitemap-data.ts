import configPromise from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import type {
  Activity,
  Lyovson,
  Note,
  Post,
  Project,
  Topic,
} from "@/payload-types";

export async function getSitemapData() {
  "use cache";
  cacheTag("sitemap");
  cacheTag("posts");
  cacheTag("projects");
  cacheTag("topics");
  cacheTag("notes");
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("sitemap");

  const payload = await getPayload({ config: configPromise });

  const [posts, projects, topics, notes, activities, lyovsons] =
    await Promise.all([
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
        overrideAccess: false,
        pagination: false,
        select: {
          id: true,
          slug: true,
          updatedAt: true,
        },
      }),
      payload.find({
        collection: "notes",
        overrideAccess: false,
        pagination: false,
        where: {
          _status: { equals: "published" },
          visibility: { equals: "public" },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      payload.find({
        collection: "activities",
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
    notes: notes.docs as Note[],
    activities: activities.docs as Activity[],
    lyovsons: lyovsons.docs as Lyovson[],
  };
}
