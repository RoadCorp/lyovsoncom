import { LoaderCircle, Search, X } from "lucide-react";
import type React from "react";
import { GridCardSection } from "@/components/grid";
import type { SearchPreviewItem } from "@/search/types";
import { GridCardNavItem } from "./grid-card-nav-item";
import { SearchInput } from "./search-input";
import { SearchPreviewItemRow } from "./search-preview-item";

function SearchPreviewEmptyState({
  isLoading,
  query,
}: {
  isLoading: boolean;
  query: string;
}) {
  const trimmedQuery = query.trim();
  let message = "Start typing to preview the top matching results here.";
  let title = "Search posts, notes, and activities";

  if (isLoading) {
    message = `Looking for matches for "${trimmedQuery}"...`;
    title = "Searching the archive";
  } else if (trimmedQuery) {
    message = `No matching results were found for "${trimmedQuery}".`;
    title = "No preview results yet";
  }

  return (
    <GridCardSection className="surface-nav-stage col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-3 px-6 text-center">
      {isLoading ? (
        <LoaderCircle
          aria-hidden="true"
          className="tone-heading h-7 w-7 animate-spin"
        />
      ) : (
        <Search aria-hidden="true" className="tone-heading h-7 w-7" />
      )}
      <h2 className="tone-heading font-bold text-lg">{title}</h2>
      <p className="tone-muted text-sm">{message}</p>
    </GridCardSection>
  );
}

export const SearchMode = ({
  isPending,
  onClose,
  onPreviewNavigate,
  onSubmit,
  previewItems,
  query,
  setQuery,
}: {
  isPending?: boolean;
  onClose: () => void;
  onPreviewNavigate: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  previewItems: SearchPreviewItem[];
  query: string;
  setQuery: (value: string) => void;
}) => {
  return (
    <>
      {previewItems.length > 0 ? (
        <>
          {previewItems.at(0) ? (
            <SearchPreviewItemRow
              className="col-start-1 col-end-4 row-start-1 row-end-2"
              item={previewItems[0]}
              onNavigate={onPreviewNavigate}
            />
          ) : null}
          {previewItems.at(1) ? (
            <SearchPreviewItemRow
              className="col-start-1 col-end-4 row-start-2 row-end-3"
              item={previewItems[1]}
              onNavigate={onPreviewNavigate}
            />
          ) : null}
        </>
      ) : (
        <SearchPreviewEmptyState
          isLoading={Boolean(isPending && query.trim())}
          query={query}
        />
      )}
      <GridCardNavItem
        className={
          "surface-nav-tile col-start-1 col-end-2 row-start-3 row-end-4"
        }
        onClick={onClose}
        variant="button"
      >
        <X aria-hidden="true" className="h-7 w-7" />
        <span>Close</span>
      </GridCardNavItem>
      <SearchInput
        className="surface-nav-tile col-start-2 col-end-4 row-start-3 row-end-4"
        isPending={isPending}
        onSubmit={onSubmit}
        setValue={setQuery}
        value={query}
      />
    </>
  );
};
