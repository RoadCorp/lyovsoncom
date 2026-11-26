import type { Metadata } from "next";
import { AppLink } from "@/components/app-link";
import { GridCard, GridCardSection } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { CornerKnots, FleuronRule } from "@/components/ornaments";
import { TopicPill } from "@/components/topic-pill";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import { getTopicIndex } from "@/utilities/get-topic";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import {
  absoluteUrl,
  homeRoute,
  topicRoute,
  topicsRoute,
} from "@/utilities/routes";
import {
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

const DESCRIPTION =
  "Every topic Rafa and Jess Lyóvson write about, with the number of posts in each.";

export default async function TopicsPage() {
  const topics = await getTopicIndex();

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Topics",
    description: DESCRIPTION,
    url: absoluteUrl(topicsRoute()),
    itemCount: topics.length,
    items: topics.map((topic) => ({
      url: absoluteUrl(topicRoute(topic.slug)),
    })),
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Topics", url: absoluteUrl(topicsRoute()) },
  ]);

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCard
        className="g2:col-start-2 g3:col-start-2 g2:col-end-3 g3:col-end-4 g2:row-start-1 g3:w-[var(--grid-card-2x1)] aspect-auto h-auto self-start"
        interactive={false}
      >
        <GridCardSection className="col-span-3 row-span-3 flex flex-col gap-5 p-6">
          <CornerKnots inset="sm" variant="triquetra" />
          <div className="relative z-1 space-y-2">
            <h1 className="tone-heading text-3xl font-bold">Topics</h1>
            <p className="tone-muted text-sm leading-relaxed">{DESCRIPTION}</p>
          </div>
          <FleuronRule className="relative z-1" variant="knot" />
          <ul className="relative z-1 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <AppLink
                  aria-label={`${topic.name}: ${topic.postCount} ${topic.postCount === 1 ? "post" : "posts"}`}
                  className="ui-focus-ring block rounded-full"
                  href={topicRoute(topic.slug)}
                  prefetch={false}
                >
                  <TopicPill className="gap-2 px-3" color={topic.color}>
                    <span>{topic.name}</span>
                    <span aria-hidden="true" className="opacity-70">
                      {topic.postCount}
                    </span>
                  </TopicPill>
                </AppLink>
              </li>
            ))}
          </ul>
        </GridCardSection>
      </GridCard>
    </>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Topics",
    description: DESCRIPTION,
    canonicalPath: topicsRoute(),
    image: {
      url: buildDynamicOgImageUrl({
        eyebrow: "Index",
        title: "Topics",
        meta: "Subjects across essays, notes, and reviews",
      }),
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      alt: "Topics",
    },
  }),
};
