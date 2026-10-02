/**
 * Adds synthetic stress content for visual review on a Neon dev branch:
 * a post with a very long title, no image, six topics, banners and code
 * blocks, and a nine-paragraph note. Re-running it updates the same slugs.
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

const [{ docs: topics }, { docs: authors }] = await Promise.all([
  payload.find({
    collection: "topics",
    depth: 0,
    limit: TOPIC_COUNT,
    select: {},
  }),
  payload.find({ collection: "lyovsons", depth: 0, limit: 1, select: {} }),
]);

async function upsert(
  collection: "notes" | "posts",
  slug: string,
  data: Record<string, unknown>
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    select: {},
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
}

await upsert("posts", POST_SLUG, {
  title:
    "An Unreasonably Long Article Title Written to Test How Cards, Heroes and Related Rows Clamp Their Text Gracefully",
  description:
    "Synthetic content on a dev branch only: code and banner blocks, no featured image, six topics.",
  type: "article",
  content: postContent,
  topics: topics.map((topic) => topic.id),
  authors: authors.map((author) => author.id),
  publishedAt: new Date().toISOString(),
});

await upsert("notes", NOTE_SLUG, {
  title: "A Long Thought That Overflows Its Card",
  type: "thought",
  content: noteContent,
  publishedAt: new Date().toISOString(),
});

process.exit(0);
