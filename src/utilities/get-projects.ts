import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "@/payload-types";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getProjects(): Promise<Project[] | null> {
  "use cache";
  cacheTag("projects");
  cacheLife("projects");

  const payload = await getPayloadClient();

  const projects = await payload.find({
    collection: "projects",
    limit: 100,
    sort: "createdAt:desc",
  });

  if (!projects?.docs?.[0]) {
    return null;
  }

  return projects.docs as Project[];
}
