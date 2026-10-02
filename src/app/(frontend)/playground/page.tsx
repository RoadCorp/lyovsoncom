import type { Metadata } from "next";
import {
  GridCard,
  GridCardSection,
  GridCardUserSocial,
} from "@/components/grid";
import { RequireUser } from "@/components/RequireUser";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function Playground() {
  return (
    <RequireUser>
      {(user) => (
        <>
          <h1 className="sr-only">Playground - Interactive Demos</h1>

          <GridCard>
            <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-4 grid place-items-center">
              {`Welcome, ${user.name} `}
            </GridCardSection>
          </GridCard>

          <GridCardUserSocial />
        </>
      )}
    </RequireUser>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Playground - Interactive Demos",
    description:
      "Explore interactive demos, experiments, and test features on the Lyóvson.com playground. Try out new components and functionality.",
    canonicalPath: "/playground",
    keywords: [
      "playground",
      "interactive demos",
      "experiments",
      "test features",
      "web development",
    ],
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Playground - Interactive Demos",
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  }),
};
