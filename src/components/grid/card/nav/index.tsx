"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { GridCard } from "@/components/grid";
import { cn } from "@/lib/utils";
import type { SearchPreviewItem } from "@/search/types";
import {
  homeRoute,
  lyovsonRoute,
  PRIMARY_LYOVSONS,
  searchHref,
  transitionTypes,
} from "@/utilities/routes";
import { useDebounce } from "@/utilities/useDebounce";
import { HeroMode } from "./hero-mode";
import { MenuMode } from "./menu-mode";
import { SearchMode } from "./search-mode";
import type { ManualMenuMode, MenuModeType, NavRouteContext } from "./types";

const SEARCH_PREVIEW_DEBOUNCE_MS = 200;
const PRIMARY_LYOVSON_SET = new Set<string>(PRIMARY_LYOVSONS);

function getNavRouteContext(pathname: string): NavRouteContext {
  const firstSegment = pathname.split("/").filter(Boolean).at(0)?.toLowerCase();

  if (!(firstSegment && PRIMARY_LYOVSON_SET.has(firstSegment))) {
    return {
      mode: "global",
      username: null,
    };
  }

  return {
    mode: "person",
    username: firstSegment,
  };
}

function getBaseRoute(routeContext: NavRouteContext) {
  if (routeContext.mode === "person" && routeContext.username) {
    return lyovsonRoute(routeContext.username);
  }

  return homeRoute();
}

interface SearchApiResponse {
  previewItems?: SearchPreviewItem[];
}

const NAV_SHELL_SCROLL = false;

export const GridCardNav = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeContext = getNavRouteContext(pathname);
  const baseRoute = getBaseRoute(routeContext);
  const activeQuery = searchParams.get("q")?.trim() || "";
  const isSearchRoute =
    pathname === "/search" ||
    (routeContext.mode === "person" &&
      routeContext.username !== null &&
      pathname === `/${routeContext.username}/search`);
  const [menuMode, setMenuMode] = useState<ManualMenuMode>("hero");
  const [showSearch, setShowSearch] = useState(
    isSearchRoute || Boolean(activeQuery)
  );
  const [query, setQuery] = useState(activeQuery);
  const [previewItems, setPreviewItems] = useState<SearchPreviewItem[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, startSearchTransition] = useTransition();
  const previousPathnameRef = useRef(pathname);
  const debouncedQuery = useDebounce(query.trim(), SEARCH_PREVIEW_DEBOUNCE_MS);

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    if (isSearchRoute || Boolean(activeQuery)) {
      setShowSearch(true);
    }
  }, [activeQuery, isSearchRoute]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    setMenuMode("hero");
    setPreviewItems([]);

    if (!isSearchRoute) {
      setShowSearch(false);
    }
  }, [isSearchRoute, pathname]);

  useEffect(() => {
    if (!(showSearch || isSearchRoute)) {
      setPreviewItems([]);
      setIsPreviewLoading(false);
      return;
    }

    if (!debouncedQuery) {
      setPreviewItems([]);
      setIsPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      limit: "2",
      preview: "true",
      q: debouncedQuery,
    });

    if (routeContext.username) {
      params.set("scope", routeContext.username);
    }

    setIsPreviewLoading(true);
    setPreviewItems([]);

    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setPreviewItems([]);
          return;
        }

        const data = (await response.json()) as SearchApiResponse;
        setPreviewItems(
          Array.isArray(data.previewItems) ? data.previewItems : []
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setPreviewItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsPreviewLoading(false);
        }
      }
    };

    loadPreview().catch(() => undefined);

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, isSearchRoute, routeContext.username, showSearch]);

  const renderMode: MenuModeType =
    isSearchRoute || showSearch ? "search" : menuMode;

  const closeSearch = () => {
    setPreviewItems([]);

    if (isSearchRoute || Boolean(activeQuery)) {
      setShowSearch(false);
      setMenuMode("hero");
      setQuery("");

      startSearchTransition(() => {
        router.push(baseRoute as Route, {
          scroll: NAV_SHELL_SCROLL,
        });
      });
      return;
    }

    setQuery("");
    setShowSearch(false);
    setMenuMode("menu");
  };

  const openSearch = () => {
    if (!(isSearchRoute || activeQuery)) {
      setQuery("");
      setPreviewItems([]);
    }

    setShowSearch(true);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      if (isSearchRoute) {
        startSearchTransition(() => {
          router.push(baseRoute as Route, {
            scroll: NAV_SHELL_SCROLL,
          });
        });
      }

      return;
    }

    const href = searchHref(trimmedQuery, {
      scopeUsername: routeContext.username,
    });

    startSearchTransition(() => {
      router.push(href as Route, {
        scroll: NAV_SHELL_SCROLL,
        transitionTypes: [transitionTypes.searchSubmit],
      });
    });
  };

  const handlePreviewNavigate = () => {
    setPreviewItems([]);
    setShowSearch(false);
    setMenuMode("hero");
  };

  return (
    <GridCard
      className={cn(
        "col-start-1 col-end-2 row-start-1 row-end-2 self-start",
        className
      )}
    >
      {
        {
          hero: (
            <HeroMode
              logoHref={baseRoute}
              routeContext={routeContext}
              setMenuMode={setMenuMode}
            />
          ),
          menu: (
            <MenuMode
              openSearch={openSearch}
              routeContext={routeContext}
              setMenuMode={setMenuMode}
            />
          ),
          search: (
            <SearchMode
              isPending={isSubmitting || isPreviewLoading}
              onClose={closeSearch}
              onPreviewNavigate={handlePreviewNavigate}
              onSubmit={handleSearchSubmit}
              previewItems={previewItems}
              query={query}
              setQuery={setQuery}
            />
          ),
        }[renderMode]
      }
    </GridCard>
  );
};

export { GridCardNavItem } from "./grid-card-nav-item";
