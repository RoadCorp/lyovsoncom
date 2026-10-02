import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs";
import type { Plugin } from "payload";

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ["topics"],
  }),
];
