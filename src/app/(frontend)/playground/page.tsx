import config from "@payload-config";
import type { Metadata } from "next";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Suspense } from "react";
import {
  GridCard,
  GridCardSection,
  GridCardUserSocial,
  SkeletonCard,
} from "@/components/grid";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function SuspensePlayground() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <Playground />
    </Suspense>
  );
}

async function Playground() {
  const headers = await nextHeaders();
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers });

  if (!user?.user) {
    redirect("/admin");
  }

  return (
    <>
      <h1 className="sr-only">Playground - Interactive Demos</h1>

      <GridCard>
        <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-4 grid place-items-center">
          {`Welcome, ${user.user?.name} `}
        </GridCardSection>
      </GridCard>

      <GridCardUserSocial />
    </>
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
