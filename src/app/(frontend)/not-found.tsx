import type { Metadata } from "next/types";

import { GridCardNotFound } from "@/components/grid";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

export default function NotFound() {
  return <GridCardNotFound />;
}

export const metadata: Metadata = {
  ...buildNotFoundMetadata({
    title: "Page Not Found (404)",
    description:
      "The page you are looking for could not be found. Browse our latest posts, projects, and articles on Lyovson.com.",
  }),
};
