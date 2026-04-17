"use client";

import { ArrowUpRight, Brain, FileText, Play, Quote } from "lucide-react";
import { AppLink } from "@/components/AppLink";
import { GridCardSection } from "@/components/grid";
import type { SearchPreviewItem } from "@/search/types";
import { transitionTypes } from "@/utilities/routes";

function PreviewIcon({ item }: { item: SearchPreviewItem }) {
  if (item.type === "post") {
    return (
      <FileText
        aria-hidden="true"
        className="tone-heading ui-group-hover-bright h-7 w-7"
      />
    );
  }

  if (item.type === "note") {
    if (item.subtitle === "Quote") {
      return (
        <Quote
          aria-hidden="true"
          className="tone-heading ui-group-hover-bright h-7 w-7"
        />
      );
    }

    return (
      <Brain
        aria-hidden="true"
        className="tone-heading ui-group-hover-bright h-7 w-7"
      />
    );
  }

  return (
    <Play
      aria-hidden="true"
      className="tone-heading ui-group-hover-bright h-7 w-7"
    />
  );
}

export function SearchPreviewItemRow({
  className,
  item,
  onNavigate,
}: {
  className: string;
  item: SearchPreviewItem;
  onNavigate: () => void;
}) {
  return (
    <GridCardSection className={className} flush={true}>
      <AppLink
        className="ui-focus-ring group block h-full rounded-lg"
        href={item.href}
        onClick={onNavigate}
        prefetch={false}
        transitionTypes={[transitionTypes.drillIn]}
      >
        <div className="surface-row grid h-full grid-cols-3 grid-rows-1 gap-2 px-3 py-3">
          <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
            <PreviewIcon item={item} />
          </div>
          <div className="col-start-2 col-end-4 row-start-1 row-end-2 flex min-w-0 flex-col justify-center gap-1">
            <p className="tone-muted text-xs uppercase tracking-[0.08em]">
              {item.subtitle}
            </p>
            <div className="flex items-start justify-between gap-3">
              <h2 className="tone-heading ui-group-hover-dim truncate font-medium text-sm">
                {item.title}
              </h2>
              <ArrowUpRight
                aria-hidden="true"
                className="tone-muted ui-group-hover-bright mt-0.5 h-4 w-4 flex-shrink-0"
              />
            </div>
            {item.description ? (
              <p className="tone-muted line-clamp-2 text-xs">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>
      </AppLink>
    </GridCardSection>
  );
}
