export const prefetch = "partial";

import type { Metadata } from "next";
import Image from "next/image";
import { PlaceholderPageCard } from "@/components/placeholder-page-card";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function AboutPage() {
  return (
    <PlaceholderPageCard
      description="A shared place for the Lyóvson family story, values, and the shape of the site."
      eyebrow="About"
      note="This page is intentionally lightweight for the menu redesign. It gives the new global navigation a stable destination while the full About page content is still being developed."
      title="About Lyóvson.com"
    >
      {/* TMDB's terms require attribution with its notice and logo. */}
      <section aria-labelledby="credits" className="space-y-3">
        <h2 className="tone-heading font-medium text-sm" id="credits">
          Credits
        </h2>
        <Image
          alt="TMDB"
          height={18}
          src="/credits/tmdb.svg"
          unoptimized
          width={139}
        />
        <p className="tone-muted text-sm leading-relaxed">
          Film and TV details and posters come from TMDB. This website uses TMDB
          and the TMDB APIs but is not endorsed, certified, or otherwise
          approved by TMDB.
        </p>
      </section>
    </PlaceholderPageCard>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "About",
    description: "About Lyóvson.com and the shared family site it is becoming.",
    canonicalPath: "/about",
    // Placeholder until written: reachable, but kept out of search.
    robots: { index: false, follow: true },
  }),
};
