import type { Metadata } from "next";
import { PlaceholderPageCard } from "@/components/PlaceholderPageCard";
import { getServerSideURL } from "@/utilities/getURL";

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
  metadataBase: new URL(getServerSideURL()),
  title: "Contact | Lyóvson.com",
  description: "Contact Lyóvson.com.",
  alternates: {
    canonical: "/contact",
  },
};
