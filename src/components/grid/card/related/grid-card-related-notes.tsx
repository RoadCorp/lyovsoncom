import { Brain, Quote } from "lucide-react";
import { ViewTransition } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { IntentLink } from "@/components/IntentLink";
import { cn } from "@/lib/utils";
import type { Note } from "@/payload-types";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { noteRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getNoteTitleTransitionName,
} from "@/utilities/view-transitions";

const RELATED_NOTE_EXCERPT_MAX = 80;

export function GridCardRelatedNotes({
  notes,
  className,
}: {
  notes: (number | Note)[];
  className?: string;
}) {
  const seen = new Set<string>();
  const uniqueNotes = notes.filter((note): note is Note & { slug: string } => {
    if (typeof note === "number" || !note.slug || seen.has(note.slug)) {
      return false;
    }
    seen.add(note.slug);
    return true;
  });

  return (
    <GridCard className={cn(className)} frameLabel="Related">
      {uniqueNotes.map((note, index) => {
        const isQuote = note.type === "quote";
        const fullText = note.content
          ? extractLexicalText(note.content).trim()
          : "";
        const isTruncated = fullText.length > RELATED_NOTE_EXCERPT_MAX;
        const excerpt = isTruncated
          ? fullText.slice(0, RELATED_NOTE_EXCERPT_MAX)
          : fullText;

        const rowClass = `row-start-${index + 1} row-end-${index + 2}`;

        return (
          <IntentLink
            aria-label={`Read related note: ${note.title}`}
            className={cn(
              "ui-focus-ring group ui-interactive col-start-1 col-end-4",
              rowClass
            )}
            href={noteRoute(note.slug || "unknown")}
            key={note.id}
            transitionTypes={[transitionTypes.drillIn]}
          >
            <GridCardSection
              className={
                "surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
              }
            >
              {/* Icon column */}
              <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
                {isQuote ? (
                  <Quote
                    aria-hidden="true"
                    className="tone-heading ui-group-hover-dim h-8 w-8"
                  />
                ) : (
                  <Brain
                    aria-hidden="true"
                    className="tone-heading ui-group-hover-dim h-8 w-8"
                  />
                )}
              </div>
              {/* Content column */}
              <div className="col-start-2 col-end-4 row-start-1 row-end-2 flex flex-col justify-center gap-1">
                <ViewTransition
                  name={getNoteTitleTransitionName(note.slug)}
                  {...frontendViewTransitionClasses.sharedTitle}
                >
                  <h2 className="tone-heading ui-group-hover-dim font-medium text-sm">
                    {note.title}
                  </h2>
                </ViewTransition>
                {excerpt && (
                  <p className="tone-muted line-clamp-2 text-xs">
                    {excerpt}
                    {isTruncated && "..."}
                  </p>
                )}
              </div>
            </GridCardSection>
          </IntentLink>
        );
      })}
    </GridCard>
  );
}
