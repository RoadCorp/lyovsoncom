import type { Metadata } from "next";
import { PlaceholderPageCard } from "@/components/PlaceholderPageCard";
import { getServerSideURL } from "@/utilities/getURL";

export default function AmPage() {
  return (
    <PlaceholderPageCard
      description="A future section for Armenian articles and writing published on Lyóvson.com."
      eyebrow="AM"
      note="This placeholder marks the planned Armenian articles section. The page exists now so the redesigned main menu can link to a real destination while the content model and publishing flow are still being prepared."
      title="Armenian Articles"
    />
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "AM | Lyóvson.com",
  description: "Future Armenian articles section on Lyóvson.com.",
  alternates: {
    canonical: "/am",
  },
};
