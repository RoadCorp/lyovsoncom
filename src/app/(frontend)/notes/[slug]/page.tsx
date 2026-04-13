import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense, ViewTransition } from "react";
import {
  GridCard,
  GridCardHeroNote,
  GridCardReferences,
  GridCardRelatedNotes,
  GridCardSection,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { OptionalErrorBoundary } from "@/components/OptionalErrorBoundary";
import RichText from "@/components/RichText";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Note, Reference } from "@/payload-types";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utilities/generate-json-ld";
import { getNote } from "@/utilities/get-note";
import { getPayloadClient } from "@/utilities/payload-client";
import { absoluteUrl, noteRoute, notesRoute } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getNoteContentTransitionName,
} from "@/utilities/view-transitions";

const NOTE_META_DESCRIPTION_MAX_LENGTH = 160;

interface Args {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NotePage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise;

  const note = await getNote(slug);
  if (!note?.content) {
    return notFound();
  }

  const articleSchema = generateArticleSchema({
    title: note.title,
    slug,
    pathPrefix: "/notes",
    publishedAt: note.publishedAt || undefined,
    updatedAt: note.updatedAt || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Notes", url: absoluteUrl(notesRoute()) },
    { name: note.title },
  ]);

  const references = getNoteReferences(note);
  const isQuoteNote = note.type === "quote";
  const quoteAttribution = getQuoteAttribution(note);
  const noteRichTextProps = {
    content: note.content,
    enableGutter: false,
    enableProse: true,
  } as const;

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <GridCardHeroNote note={note} />

      <GridCard
        className={cn(
          "g2:col-start-2 g2:col-end-3 g2:row-start-2 g2:row-end-3",
          "g3:col-start-2 g3:col-end-3 g3:row-start-2 g3:row-end-3",
          "aspect-auto h-auto"
        )}
        interactive={false}
      >
        <GridCardSection className="col-span-3 row-span-3 p-6">
          <ViewTransition
            name={getNoteContentTransitionName(slug)}
            {...frontendViewTransitionClasses.sharedContent}
          >
            {isQuoteNote ? (
              <article className="glass-note-stage glass-stagger-3" dir="auto">
                <span aria-hidden="true" className="glass-note-quote-mark">
                  &ldquo;
                </span>
                <RichText
                  className="glass-note-quote-prose"
                  {...noteRichTextProps}
                />
                {quoteAttribution ? (
                  <footer className="glass-note-quote-attribution" dir="auto">
                    <cite>— {quoteAttribution}</cite>
                  </footer>
                ) : null}
              </article>
            ) : (
              <article
                className="glass-note-thought-stage glass-stagger-3"
                dir="auto"
              >
                <RichText
                  className="glass-note-thought-prose"
                  {...noteRichTextProps}
                />
              </article>
            )}
          </ViewTransition>
        </GridCardSection>
      </GridCard>

      <aside
        className={cn(
          "col-start-1 col-end-2 grid auto-rows-max gap-4 self-start",
          "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5",
          "g3:col-start-3 g3:col-end-4 g3:row-start-1 g3:row-end-3"
        )}
      >
        {references.length > 0 ? (
          <div>
            <GridCardReferences references={references} />
          </div>
        ) : null}
        <div>
          <OptionalErrorBoundary title="Unable to load related notes.">
            <Suspense
              fallback={
                <div className="glass-section glass-loading h-[var(--grid-card-1x1)] w-[var(--grid-card-1x1)] animate-pulse rounded-xl">
                  <Skeleton className="glass-badge h-full w-full" />
                </div>
              }
            >
              <RelatedNotes
                recommendedIds={
                  note.recommended_note_ids as number[] | undefined
                }
              />
            </Suspense>
          </OptionalErrorBoundary>
        </div>
      </aside>
    </>
  );
}

async function RelatedNotes({ recommendedIds }: { recommendedIds?: number[] }) {
  if (!(recommendedIds && recommendedIds.length > 0)) {
    return null;
  }

  const payload = await getPayloadClient();
  const notes = await payload.find({
    collection: "notes",
    depth: 1,
    limit: recommendedIds.length,
    where: {
      id: {
        in: recommendedIds,
      },
    },
  });

  const docs = notes.docs as Note[];
  if (docs.length === 0) {
    return null;
  }

  return <GridCardRelatedNotes notes={docs} />;
}

function getNoteReferences(note: Note): Reference[] {
  const refs: Reference[] = [];

  if (note.type === "quote") {
    const source = note.sourceReference;
    if (typeof source === "object" && source !== null) {
      refs.push(source as Reference);
    }
  }

  if (!note.connections) {
    return refs;
  }

  for (const connection of note.connections) {
    if (
      typeof connection === "object" &&
      connection !== null &&
      "relationTo" in connection &&
      connection.relationTo === "references" &&
      typeof connection.value === "object" &&
      connection.value !== null
    ) {
      refs.push(connection.value as Reference);
    }
  }

  return refs;
}

function getQuoteAttribution(
  note: Pick<Note, "type" | "quotedPerson" | "sourceReference">
): string | null {
  if (note.type !== "quote") {
    return null;
  }

  if (note.quotedPerson) {
    return note.quotedPerson;
  }

  const sourceTitle =
    note.sourceReference && typeof note.sourceReference === "object"
      ? note.sourceReference.title
      : null;

  return sourceTitle || null;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("notes");
  cacheLife("static");

  const payload = await getPayloadClient();
  const notes = await payload.find({
    collection: "notes",
    limit: 1000,
    select: {
      slug: true,
    },
    where: {
      _status: {
        equals: "published",
      },
    },
  });

  return ensureStaticParams(
    notes.docs
      .filter((note) => note.slug)
      .map((note) => ({
        slug: note.slug,
      })),
    { slug: "__placeholder__" }
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug } = await paramsPromise;

  const note = await getNote(slug);
  if (!note) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested note could not be found",
    };
  }

  const title = note.title;
  const contentText = note.content
    ? extractLexicalText(note.content).trim()
    : "";
  const description =
    contentText.length > 0
      ? contentText.slice(0, NOTE_META_DESCRIPTION_MAX_LENGTH)
      : "A note or thought";

  return {
    title: `${title} | Lyóvson.com`,
    description,
    alternates: {
      canonical: noteRoute(slug),
    },
    openGraph: {
      title: `${title} | Lyóvson.com`,
      description,
      url: noteRoute(slug),
      siteName: "Lyóvson.com",
      type: "article",
      publishedTime: note.publishedAt || undefined,
      modifiedTime: note.updatedAt || undefined,
    },
    twitter: {
      card: "summary",
      title: `${title} | Lyóvson.com`,
      description,
    },
  };
}
