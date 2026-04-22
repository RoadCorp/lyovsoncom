import type { Metadata } from "next/types";

import { GridCardNotFound } from "@/components/grid";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

export default function NotFound() {
  return <GridCardNotFound />;
}

export const metadata: Metadata = {
  ...buildNotFoundMetadata({
    title: "Project Not Found (404)",
    description:
      "The project you are looking for could not be found. Browse our available projects and latest content on Lyovson.com.",
  }),
};
