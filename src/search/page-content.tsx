import { ArchiveItems } from "@/components/ArchiveItems";
import { GridCardEmptyState } from "@/components/grid";
import {
  hydrateSearchResults,
  runHybridSearch,
  SearchInputError,
} from "@/search/service";
import { getPayloadClient } from "@/utilities/payload-client";

const SEARCH_RESULTS_LIMIT = 12;
const SEARCH_FAILURE_STATUS = 500;

interface SearchPageContentProps {
  query: string | undefined;
  scopeLabel?: string;
  scopeUsername?: string | null;
}

interface SearchEmptyStateProps {
  description: string;
  heading: string;
  title: string;
}

function SearchEmptyState({
  description,
  heading,
  title,
}: SearchEmptyStateProps) {
  return (
    <>
      <h1 className="sr-only">{heading}</h1>
      <GridCardEmptyState description={description} title={title} />
    </>
  );
}

async function logSearchPageFailure(
  query: string,
  scopeUsername: string | null | undefined,
  error: unknown
) {
  try {
    const payload = await getPayloadClient();

    payload.logger.error({
      msg: "app.search.page.failed",
      query,
      queryLength: query.length,
      scopeUsername: scopeUsername || null,
      error: error instanceof Error ? error.message : String(error),
    });
  } catch {
    // Logging failures should never replace the original empty/error UI.
  }
}

function getScopeText(
  scopeLabel: string | undefined,
  scopeUsername?: string | null
) {
  if (!scopeUsername) {
    return "Lyóvson.com";
  }

  return scopeLabel || scopeUsername;
}

export async function SearchPageContent({
  query,
  scopeLabel,
  scopeUsername,
}: SearchPageContentProps) {
  const normalizedQuery = query?.trim() || "";
  const scopeText = getScopeText(scopeLabel, scopeUsername);
  const headingText = normalizedQuery
    ? `Search Results for "${normalizedQuery}"`
    : "Search";

  if (!normalizedQuery) {
    return (
      <SearchEmptyState
        description={
          scopeUsername
            ? `Use the search box to find posts, notes, and activities for ${scopeText}.`
            : "Use the search box to find posts, notes, and activities across Lyóvson.com."
        }
        heading={headingText}
        title="Search the Site"
      />
    );
  }

  try {
    const searchResults = await runHybridSearch(normalizedQuery, {
      limit: SEARCH_RESULTS_LIMIT,
      scopeUsername,
    });

    if (!searchResults.results || searchResults.results.length === 0) {
      return (
        <SearchEmptyState
          description={
            scopeUsername
              ? `No posts, notes, or activities matched "${normalizedQuery}" for ${scopeText}.`
              : `No posts, notes, or activities matched "${normalizedQuery}".`
          }
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    const sortedItems = await hydrateSearchResults(searchResults.results);

    if (sortedItems.length === 0) {
      return (
        <SearchEmptyState
          description={
            scopeUsername
              ? `No public results matched "${normalizedQuery}" for ${scopeText}.`
              : `No public results matched "${normalizedQuery}".`
          }
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    return (
      <>
        <h1 className="sr-only">{headingText}</h1>
        <ArchiveItems items={sortedItems} />
      </>
    );
  } catch (error) {
    if (
      error instanceof SearchInputError &&
      error.status < SEARCH_FAILURE_STATUS
    ) {
      return (
        <SearchEmptyState
          description={
            scopeUsername
              ? `No posts, notes, or activities matched "${normalizedQuery}" for ${scopeText}.`
              : `No posts, notes, or activities matched "${normalizedQuery}".`
          }
          heading={headingText}
          title="No Results Found"
        />
      );
    }

    await logSearchPageFailure(normalizedQuery, scopeUsername, error);

    return (
      <SearchEmptyState
        description="Search is temporarily unavailable. Please try again in a moment."
        heading={headingText}
        title="Search Unavailable"
      />
    );
  }
}
