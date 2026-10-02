import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";

export const Projects: CollectionConfig<"projects"> = {
  slug: "projects",
  // Fields returned when another document references this one.
  defaultPopulate: {
    name: true,
    slug: true,
    image: true,
    description: true,
    updatedAt: true,
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: "Organization",
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    seoField,
    ...slugField("name"),
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        req.payload.logger.info(`Updating cache for project: ${doc.slug}`);

        // Revalidate project-related cache tags
        revalidateTag("projects", { expire: 0 });
        revalidateTag(`project-${doc.slug}`, { expire: 0 });
        revalidateTag("posts", { expire: 0 }); // Posts may reference this project
        revalidateTag("sitemap", { expire: 0 });

        // Revalidate project paths
        revalidatePath(`/projects/${doc.slug}`);
        revalidatePath("/projects"); // Listing page
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        req.payload.logger.info(
          `Updating cache after project deletion: ${doc?.slug}`
        );

        // Revalidate project-related cache tags
        revalidateTag("projects", { expire: 0 });
        revalidateTag(`project-${doc?.slug}`, { expire: 0 });
        revalidateTag("posts", { expire: 0 }); // Posts may reference this project
        revalidateTag("sitemap", { expire: 0 });

        // Revalidate project paths
        revalidatePath(`/projects/${doc?.slug}`);
        revalidatePath("/projects"); // Listing page
      },
    ],
  },
};
