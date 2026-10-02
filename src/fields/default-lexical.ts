import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
} from "@payloadcms/richtext-lexical";
import type { Config } from "payload";

export const defaultLexical: Config["editor"] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      StrikethroughFeature(),
      LinkFeature({
        enabledCollections: ["posts"],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
            if ("name" in field && field.name === "url") {
              return false;
            }
            return true;
          });

          return [
            ...defaultFieldsWithoutUrl,
            {
              name: "url",
              type: "text",
              admin: {
                condition: ({ linkType }) => linkType !== "internal",
              },
              label: ({ t }) => t("fields:enterURL"),
              required: true,
            },
          ];
        },
      }),
    ];
  },
});
