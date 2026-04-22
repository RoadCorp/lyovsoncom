import type { Metadata } from "next";
import { PlaceholderPageCard } from "@/components/PlaceholderPageCard";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function ContactPage() {
  return (
    <PlaceholderPageCard
      description="A global contact entry point for the site, separate from person-specific contact pages."
      eyebrow="Contact"
      note="This is a placeholder destination for the redesigned main menu. It will later expand into the full global contact page for Lyóvson.com."
      title="Contact Lyóvson.com"
    />
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Contact",
    description: "Contact Lyóvson.com.",
    canonicalPath: "/contact",
  }),
};
