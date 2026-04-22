import type { Metadata } from "next";
import { PlaceholderPageCard } from "@/components/PlaceholderPageCard";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function AboutPage() {
  return (
    <PlaceholderPageCard
      description="A shared place for the Lyóvson family story, values, and the shape of the site."
      eyebrow="About"
      note="This page is intentionally lightweight for the menu redesign. It gives the new global navigation a stable destination while the full About page content is still being developed."
      title="About Lyóvson.com"
    />
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "About",
    description: "About Lyóvson.com and the shared family site it is becoming.",
    canonicalPath: "/about",
  }),
};
