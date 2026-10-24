import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { lyovsonOrAgent } from "@/access/agents";

import { anyone } from "@/access/anyone";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";

export const Topics: CollectionConfig = {
  slug: "topics",
  // Fields returned when another document references this one.
  defaultPopulate: {
    name: true,
    slug: true,
    color: true,
    description: true,
    updatedAt: true,
  },
  access: {
    create: lyovsonOrAgent,
    delete: lyovsonOrAgent,
    read: anyone,
    // Payload 4 lets versions inherit `read`; keep history private.
    readVersions: lyovsonOrAgent,
    update: lyovsonOrAgent,
  },
  // Topics nest under a parent topic; the admin gets Payload's tree view.
  hierarchy: {
    parentFieldName: "parent",
    slugField: "slug",
  },
  admin: {
    group: "Organization",
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "parent"],
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
      name: "color",
      type: "text",
      admin: {
        description:
          "Hex color code (e.g. #FF0000). Leave empty to inherit from parent.",
      },
    },
    seoField,
    slugField("name"),
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // If no color is set and there's a parent, inherit parent's color
        if (!data.color && data.parent) {
          const parentTopic = await req.payload.findByID({
            collection: "topics",
            id: data.parent,
            overrideAccess: true,
          });
          if (parentTopic && "color" in parentTopic && parentTopic.color) {
            data.color = parentTopic.color;
          }
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        // Payload's hierarchy deletes child topics with their parent. Detach
        // them first so their posts keep the topic. Not moved up a
        // level: in a bulk delete the grandparent may be deleted too.
        await req.payload.update({
          collection: "topics",
          where: { parent: { equals: id } },
          data: { parent: null },
          depth: 0,
          overrideAccess: true,
          req,
        });
      },
    ],
    afterChange: [
      ({ context, doc, req }) => {
        if (context?.skipRevalidation) {
          return;
        }
        req.payload.logger.info(`Updating cache for topic: ${doc.slug}`);

        // Revalidate topic-related cache tags
        revalidateTag("topics", { expire: 0 });
        revalidateTag(`topic-${doc.slug}`, { expire: 0 });
        revalidateTag("posts", { expire: 0 }); // Posts may reference this topic
        revalidateTag("sitemap", { expire: 0 });

        // Revalidate topic path
        revalidatePath(`/topics/${doc.slug}`);
      },
    ],
    afterDelete: [
      ({ context, doc, req }) => {
        if (context?.skipRevalidation) {
          return;
        }
        req.payload.logger.info(
          `Updating cache after topic deletion: ${doc?.slug}`
        );

        // Revalidate topic-related cache tags
        revalidateTag("topics", { expire: 0 });
        revalidateTag(`topic-${doc?.slug}`, { expire: 0 });
        revalidateTag("posts", { expire: 0 }); // Posts may reference this topic
        revalidateTag("sitemap", { expire: 0 });

        // Revalidate topic path
        revalidatePath(`/topics/${doc?.slug}`);
      },
    ],
  },
};
