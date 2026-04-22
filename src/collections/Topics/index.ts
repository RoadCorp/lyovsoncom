import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";

export const Topics: CollectionConfig = {
  slug: "topics",
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
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
    ...slugField("name"),
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // If no color is set and there's a parent, inherit parent's color
        if (!data.color && data.parent) {
          const parentTopic = await req.payload.findByID({
            collection: "topics",
            id: data.parent,
          });
          if (parentTopic && "color" in parentTopic && parentTopic.color) {
            data.color = parentTopic.color;
          }
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, req }) => {
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
      ({ doc, req }) => {
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
