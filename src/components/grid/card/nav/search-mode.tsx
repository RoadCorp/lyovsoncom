import { Search, X } from "lucide-react";
import type React from "react";
import { ViewTransition } from "react";
import { GridCardSection } from "../section";
import { GridCardNavItem } from "./grid-card-nav-item";
import { SearchInput } from "./search-input";

export const SearchMode = ({
  isPending,
  onClose,
  onSubmit,
  query,
  setQuery,
}: {
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  query: string;
  setQuery: (value: string) => void;
}) => {
  return (
    <>
      <GridCardSection className="surface-nav-stage col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <ViewTransition
          default="none"
          name="nav-search-icon"
          share="vt-control"
        >
          <span className="inline-flex">
            <Search aria-hidden="true" className="tone-heading h-7 w-7" />
          </span>
        </ViewTransition>
        <h2 className="tone-heading font-bold text-lg">Search the archive</h2>
        <p className="tone-muted text-sm">
          Find posts, notes, and activities by topic or idea. Enter your search
          below and press Enter.
        </p>
      </GridCardSection>
      <ViewTransition
        default="none"
        name="nav-close-control"
        share="vt-control"
      >
        <GridCardNavItem
          className="surface-nav-tile col-start-1 col-end-2 row-start-3 row-end-4"
          onClick={onClose}
          variant="button"
        >
          <X aria-hidden="true" className="h-7 w-7" />
          <span>Close</span>
        </GridCardNavItem>
      </ViewTransition>
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
