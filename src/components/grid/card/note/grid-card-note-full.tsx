import { Brain, Calendar, PenTool, Quote } from "lucide-react";
import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { TopicPill } from "@/components/TopicPill";
import type { Note, Topic } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import {
  extractLexicalText,
  extractLexicalTextWithNewlines,
} from "@/utilities/extract-lexical-text";
import { noteRoute, topicRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getNoteContentTransitionName,
} from "@/utilities/view-transitions";

const QUOTE_PREVIEW_MAX_CHARS = 360;
const THOUGHT_PREVIEW_MAX_CHARS = 520;
const MAX_TOPIC_STAGGER = 6;
const UNKNOWN_NOTE_SLUG = "unknown";
const QUOTE_TRUNCATION_MASK_CLASS =
  "[-webkit-mask-image:linear-gradient(to_bottom,black_72%,transparent)] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]";
const THOUGHT_TRUNCATION_MASK_CLASS =
  "[-webkit-mask-image:linear-gradient(to_bottom,black_74%,transparent)] [mask-image:linear-gradient(to_bottom,black_74%,transparent)]";

export interface GridCardNoteProps {
  className?: string;
  loading?: "lazy" | "eager";
  note: Note;
  priority?: boolean;
}

interface NotePreview {
  attribution: string | null;
  excerpt: string;
  isMultiLineThought: boolean;
  isPoem: boolean;
  isQuote: boolean;
  isTruncated: boolean;
}

function getNoteUrl(slug: Note["slug"]) {
  return noteRoute(slug ?? UNKNOWN_NOTE_SLUG);
}

function getAttribution(note: Pick<Note, "quotedPerson" | "sourceReference">) {
  const referenceTitle =
    note.sourceReference && typeof note.sourceReference === "object"
      ? note.sourceReference.title
      : null;

  return note.quotedPerson || referenceTitle || null;
}

function getPreviewText(isQuote: boolean, content: Note["content"]) {
  return isQuote
    ? extractLexicalTextWithNewlines(content).trim()
    : extractLexicalText(content).trim();
}

function getNotePreview(
  note: Pick<Note, "type" | "content" | "quotedPerson" | "sourceReference">
): NotePreview {
  const isQuote = note.type === "quote";
  const previewText = getPreviewText(isQuote, note.content);
  const maxChars = isQuote
    ? QUOTE_PREVIEW_MAX_CHARS
    : THOUGHT_PREVIEW_MAX_CHARS;
  const isTruncated = previewText.length > maxChars;
  const excerpt = isTruncated
    ? previewText.slice(0, maxChars).trimEnd()
    : previewText;

  return {
    attribution: getAttribution(note),
    excerpt,
    isMultiLineThought: !isQuote && previewText.includes("\n"),
    isPoem: isQuote && previewText.includes("\n"),
    isQuote,
    isTruncated,
  };
}

function getUniqueTopics(topics: Note["topics"]): Topic[] {
  if (!(Array.isArray(topics) && topics.length > 0)) {
    return [];
  }

  const uniqueTopics = new Map<number, Topic>();

  for (const topic of topics) {
    if (
      !(
        typeof topic === "object" &&
        topic !== null &&
        typeof topic.id === "number"
      )
    ) {
      continue;
    }

    if (!uniqueTopics.has(topic.id)) {
      uniqueTopics.set(topic.id, topic);
    }
  }

  return [...uniqueTopics.values()];
}

function getTopicStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_TOPIC_STAGGER)}`;
}

function NoteQuoteContent({
  attribution,
  excerpt,
  isPoem,
  isTruncated,
}: Pick<NotePreview, "attribution" | "excerpt" | "isPoem" | "isTruncated">) {
  return (
    <div className="relative flex h-full flex-col justify-start px-6 py-6">
      <p
        className={[
          "tone-heading overflow-hidden break-words pr-10 text-left text-[15px] italic leading-snug",
          isTruncated ? QUOTE_TRUNCATION_MASK_CLASS : "",
          isPoem ? "whitespace-pre-line" : "whitespace-normal",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isPoem ? excerpt : `“${excerpt}”`}
      </p>

      {isTruncated || attribution ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {isTruncated ? (
              <span className="tone-muted text-xs tracking-widest">***</span>
            ) : null}
          </div>
          <div className="min-w-0 text-right">
            {attribution ? (
              <cite className="tone-muted block truncate font-normal text-xs not-italic before:mr-2 before:content-['—']">
                {attribution}
              </cite>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NoteThoughtContent({
  excerpt,
  isMultiLineThought,
  isTruncated,
}: Pick<NotePreview, "excerpt" | "isMultiLineThought" | "isTruncated">) {
  return (
    <div className="relative flex h-full flex-col justify-start px-6 py-6">
      <p
        className={[
          "tone-heading overflow-hidden text-pretty break-words pr-10 text-left text-[15px] leading-relaxed",
          "tracking-[-0.01em]",
          isTruncated ? THOUGHT_TRUNCATION_MASK_CLASS : "",
          isMultiLineThought ? "whitespace-pre-line" : "whitespace-normal",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {excerpt}
      </p>

      {isTruncated ? (
        <span className="tone-muted pointer-events-none absolute right-6 bottom-4 text-xs tracking-widest">
          ***
        </span>
      ) : null}
    </div>
  );
}

function NoteContentPreview({
  noteUrl,
  preview,
  slug,
}: {
  noteUrl: ReturnType<typeof noteRoute>;
  preview: NotePreview;
  slug: string;
}) {
  return (
    <AppLink
      className="ui-focus-ring group block h-full"
      href={noteUrl}
      prefetch={false}
      transitionTypes={[transitionTypes.drillIn]}
    >
      <ViewTransition
        name={getNoteContentTransitionName(slug)}
        {...frontendViewTransitionClasses.sharedContent}
      >
        {preview.isQuote ? (
          <NoteQuoteContent
            attribution={preview.attribution}
            excerpt={preview.excerpt}
            isPoem={preview.isPoem}
            isTruncated={preview.isTruncated}
          />
        ) : (
          <NoteThoughtContent
            excerpt={preview.excerpt}
            isMultiLineThought={preview.isMultiLineThought}
            isTruncated={preview.isTruncated}
          />
        )}
      </ViewTransition>
    </AppLink>
  );
}

export const GridCardNoteFull = ({ note, className }: GridCardNoteProps) => {
  const {
    slug,
    type,
    publishedAt,
    author,
    topics,
    content,
    quotedPerson,
    sourceReference,
  } = note;

  const noteSlug = slug ?? UNKNOWN_NOTE_SLUG;
  const noteUrl = getNoteUrl(slug);
  const isQuoteType = type === "quote";
  const typeLabel = isQuoteType ? "quote" : "thought";
  const preview = getNotePreview({
    type,
    content,
    quotedPerson,
    sourceReference,
  });
  const uniqueTopics = getUniqueTopics(topics);

  return (
    <GridCard className={className}>
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex h-full flex-col overflow-hidden">
        <NoteContentPreview
          noteUrl={noteUrl}
          preview={preview}
          slug={noteSlug}
        />
      </GridCardSection>

      <GridCardSection className="surface-rail-panel card-rail-stack card-topic-stack col-start-1 col-end-2 row-start-3 row-end-4 h-full">
        {uniqueTopics.map((topic, index) => {
          if (!topic.slug) {
            return null;
          }

          return (
            <AppLink
              aria-label={`View notes about ${topic.name}`}
              className={`w-full ${getTopicStaggerClass(index)}`}
              href={topicRoute(topic.slug)}
              key={topic.id}
              prefetch={false}
            >
              <TopicPill>{topic.name}</TopicPill>
            </AppLink>
          );
        })}
      </GridCardSection>

      <GridCardSection className="surface-rail-panel card-rail-stack card-meta-stack col-start-2 col-end-3 row-start-3 row-end-4">
        {author ? (
          <div className="tone-muted flex items-center gap-2 text-xs capitalize">
            <PenTool aria-hidden="true" className="h-5 w-5" />
            <span className="font-medium">{author}</span>
          </div>
        ) : null}

        <div className="tone-muted flex items-center gap-2 text-xs">
          <Calendar aria-hidden="true" className="h-5 w-5" />
          <time dateTime={publishedAt || undefined}>
            {formatShortDate(publishedAt)}
          </time>
        </div>
      </GridCardSection>

      <GridCardSection className="surface-rail-panel col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1">
        <AppLink
          className="ui-focus-ring group block flex flex-col items-center gap-1"
          href={noteUrl}
          prefetch={false}
          transitionTypes={[transitionTypes.drillIn]}
        >
          {isQuoteType ? (
            <Quote
              aria-hidden="true"
              className="tone-heading ui-group-hover-dim h-5 w-5"
            />
          ) : (
            <Brain
              aria-hidden="true"
              className="tone-heading ui-group-hover-dim h-5 w-5"
            />
          )}
          <span className="tone-muted text-xs capitalize">{typeLabel}</span>
        </AppLink>
      </GridCardSection>
    </GridCard>
  );
};
