/**
 * Adds synthetic stress content for visual review on a Neon dev branch:
 * a post with a very long title, no image, six topics, banners and code
 * blocks, a nine-paragraph note, and two portfolio projects (one with every
 * case-study field filled, one minimal). Re-running it updates the same slugs.
 *
 * Refuses to run unless POSTGRES_URL points at a host listed in
 * STRESS_SEED_ALLOWED_HOSTS (comma-separated), so it can't touch production.
 *
 *   STRESS_SEED_ALLOWED_HOSTS=ep-example-123 pnpm payload run scripts/seed-stress-content.ts
 */
import configPromise from "@payload-config";
import { getPayload } from "payload";

const allowedHosts = (process.env.STRESS_SEED_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);
const databaseHost = new URL(process.env.POSTGRES_URL ?? "postgres://none")
  .hostname;

if (!allowedHosts.some((host) => databaseHost.startsWith(host))) {
  throw new Error(
    `Refusing to seed ${databaseHost}: add a dev branch host to STRESS_SEED_ALLOWED_HOSTS.`
  );
}

const POST_SLUG = "audit-stress-long-title-no-image";
const CASE_STUDY_SLUG = "audit-stress-case-study";
const MINIMAL_PROJECT_SLUG = "audit-stress-minimal-project";
const NOTE_SLUG = "audit-stress-long-note";
const TOPIC_COUNT = 6;
const NOTE_PARAGRAPHS = 9;
const NOTE_SENTENCE =
  "A long note keeps going so the archive card has to decide how to fade or clamp it. ";

const text = (value: string) => ({
  mode: "normal",
  text: value,
  type: "text",
  style: "",
  detail: 0,
  format: 0,
  version: 1,
});

const paragraph = (value: string) => ({
  type: "paragraph",
  format: "",
  indent: 0,
  version: 1,
  children: [text(value)],
  direction: "ltr",
  textStyle: "",
  textFormat: 0,
});

const root = (children: unknown[]) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children,
    direction: "ltr",
  },
});

const block = (fields: Record<string, unknown>) => ({
  type: "block",
  fields: { blockName: "", ...fields },
  format: "",
  version: 2,
});

const postContent = root([
  paragraph(
    "This post exists only on dev branches to exercise blocks that published content does not use."
  ),
  block({
    blockType: "banner",
    style: "info",
    content: root([paragraph("Info banner: a short note for readers.")]),
  }),
  block({
    blockType: "banner",
    style: "warning",
    content: root([
      paragraph(
        "Warning banner: something to be careful about, written long enough to wrap onto a second line on phones."
      ),
    ]),
  }),
  block({
    blockType: "code",
    language: "typescript",
    code: `export async function getPublishedPosts(limit = 12) {\n  const payload = await getPayload({ config });\n  return payload.find({\n    collection: "posts",\n    where: { _status: { equals: "published" } },\n    depth: 1,\n    limit,\n  });\n}\n\n// A deliberately long line to check horizontal scrolling inside the code block on narrow screens: ${"x".repeat(80)}`,
  }),
  block({
    blockType: "code",
    language: "css",
    code: ".surface-card {\n  border-radius: var(--radius);\n}",
  }),
  paragraph("End of synthetic content."),
]);

const noteContent = root(
  Array.from({ length: NOTE_PARAGRAPHS }, (_, index) =>
    paragraph(`Paragraph ${index + 1}. ${NOTE_SENTENCE.repeat(3)}`)
  )
);

const payload = await getPayload({ config: await configPromise });

const [{ docs: topics }, { docs: people }, { docs: images }] =
  await Promise.all([
    payload.find({
      collection: "topics",
      depth: 0,
      limit: TOPIC_COUNT,
      select: {},
      overrideAccess: true,
    }),
    payload.find({
      collection: "lyovsons",
      depth: 0,
      limit: 2,
      select: {},
      sort: "id",
      overrideAccess: true,
    }),
    payload.find({
      collection: "media",
      depth: 0,
      limit: 200,
      select: { width: true, height: true },
      where: { mimeType: { like: "image/" } },
      overrideAccess: true,
    }),
  ]);
const authors = people.slice(0, 1);
const landscape = images.filter(
  (image) => (image.width ?? 0) > (image.height ?? 0) * 1.3
);
const portrait = images.filter(
  (image) => (image.height ?? 0) > (image.width ?? 0)
);

async function upsert(
  collection: "notes" | "posts" | "projects",
  slug: string,
  data: Record<string, unknown>
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    select: {},
    overrideAccess: true,
  });
  const common = {
    collection,
    data: { ...data, slug, _status: "published" },
    overrideAccess: true,
    // No Next request here, so skip cache invalidation and embedding work.
    context: { skipEmbeddingGeneration: true, skipRevalidation: true },
  } as const;
  const doc = docs[0]
    ? await payload.update({ ...common, id: docs[0].id })
    : await payload.create(common as never);
  payload.logger.info({
    msg: "stress_seed.upserted",
    collection,
    id: doc.id,
    slug,
  });
  return doc.id;
}

const section = (heading: string, paragraphs: number) => ({
  heading,
  content: root(
    Array.from({ length: paragraphs }, (_, index) =>
      paragraph(
        `${heading}, paragraph ${index + 1}. ${NOTE_SENTENCE.repeat(2)}`
      )
    )
  ),
});

const caseStudyId = await upsert("projects", CASE_STUDY_SLUG, {
  name: "Audit Stress: A Portfolio Project With a Deliberately Long Name",
  description:
    "Synthetic portfolio work on a dev branch only: every case-study field is filled.",
  image: landscape[0]?.id,
  people: people.map((person) => person.id),
  url: "https://example.com",
  repository: "https://github.com/example/example",
  client: "Example Organisation With a Long Name",
  role: "Design, engineering & content",
  startedAt: "2025-01-01T12:00:00.000Z",
  stack: [
    "Next.js",
    "React",
    "Payload CMS",
    "Postgres",
    "Neon",
    "Vercel",
    "Tailwind CSS",
    "TypeScript",
    "Playwright",
  ],
  highlights: [
    { value: "3", label: "Languages" },
    { value: "224", label: "Sources" },
    { value: "1,699", label: "Commits" },
    { value: "100", label: "Lighthouse" },
  ],
  caseStudy: [
    section("Problem & business", 3),
    section("Design", 2),
    {
      heading: "Engineering",
      content: root([
        paragraph("Engineering, with a code block and a subheading."),
        {
          ...paragraph("A subheading inside a section"),
          type: "heading",
          tag: "h3",
        },
        block({
          blockType: "code",
          language: "typescript",
          code: "export const answer = 42;",
        }),
      ]),
    },
    section("Outcome", 1),
    section("What I'd change", 1),
  ],
  gallery: [
    ...landscape.slice(0, 2).map((image, index) => ({
      image: image.id,
      alt: `Synthetic wide screenshot ${index + 1}`,
      caption: index === 0 ? "Home page, light theme" : undefined,
      capturedAt: "2026-10-16T12:00:00.000Z",
    })),
    ...portrait.slice(0, 2).map((image, index) => ({
      image: image.id,
      alt: `Synthetic phone screenshot ${index + 1}`,
      caption: "Phone, dark theme",
    })),
  ],
});

await upsert("projects", MINIMAL_PROJECT_SLUG, {
  name: "Audit Stress Minimal",
  description: "A portfolio project with only the required fields.",
  people: authors.map((author) => author.id),
  startedAt: "2023-06-01T12:00:00.000Z",
  endedAt: "2024-02-01T12:00:00.000Z",
  caseStudy: [section("Problem & business", 1)],
});

await upsert("posts", POST_SLUG, {
  title:
    "An Unreasonably Long Article Title Written to Test How Cards, Heroes and Related Rows Clamp Their Text Gracefully",
  description:
    "Synthetic content on a dev branch only: code and banner blocks, no featured image, six topics.",
  type: "article",
  content: postContent,
  topics: topics.map((topic) => topic.id),
  authors: authors.map((author) => author.id),
  project: caseStudyId,
  publishedAt: new Date().toISOString(),
});

await upsert("notes", NOTE_SLUG, {
  title: "A Long Thought That Overflows Its Card",
  type: "thought",
  author: "rafa",
  content: noteContent,
  publishedAt: new Date().toISOString(),
});

process.exit(0);
