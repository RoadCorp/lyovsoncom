"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
  ViewTransition,
} from "react";
import { GridCard } from "@/components/grid/card";
import { cn } from "@/lib/utils";
import {
  homeRoute,
  lyovsonRoute,
  PRIMARY_LYOVSONS,
  searchHref,
  transitionTypes,
} from "@/utilities/routes";
import { HeroMode } from "./hero-mode";
import { MenuMode } from "./menu-mode";
import { SearchMode } from "./search-mode";
import type { ManualMenuMode, MenuModeType, NavRouteContext } from "./types";

const PRIMARY_LYOVSON_SET = new Set<string>(PRIMARY_LYOVSONS);

function getNavRouteContext(pathname: string): NavRouteContext {
  const firstSegment = pathname.split("/").find(Boolean)?.toLowerCase();

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
  const [navigationMode, setNavigationMode] = useState<{
    pathname: string;
    mode: MenuModeType;
  }>({ pathname, mode: "hero" });
  const queryKey = `${pathname}?${activeQuery}`;
  const [searchInput, setSearchInput] = useState({
    queryKey,
    value: activeQuery,
  });
  // Reset only when the URL changes, including revisiting an earlier query.
  // A render-time adjustment avoids an extra effect commit during the animation.
  if (searchInput.queryKey !== queryKey) {
    setSearchInput({ queryKey, value: activeQuery });
  }
  const query =
    searchInput.queryKey === queryKey ? searchInput.value : activeQuery;
  const setQuery = (value: string) => setSearchInput({ queryKey, value });
  const [isSubmitting, startSearchTransition] = useTransition();
  const restoreSearchFocusRef = useRef(false);
  const restoreMenuFocusRef = useRef(false);
  const localMode =
    navigationMode.pathname === pathname ? navigationMode.mode : "hero";
  const renderMode = isSearchRoute ? "search" : localMode;

  useEffect(() => {
    if (renderMode === "search") {
      return;
    }

    if (restoreSearchFocusRef.current) {
      restoreSearchFocusRef.current = false;
      document.getElementById("nav-search-trigger")?.focus();
    } else if (restoreMenuFocusRef.current) {
      restoreMenuFocusRef.current = false;
      document
        .getElementById(
          renderMode === "menu" ? "nav-first-link" : "nav-menu-trigger"
        )
        ?.focus();
    }
  }, [renderMode]);

  const changeMenuMode = (mode: ManualMenuMode) => {
    restoreMenuFocusRef.current = true;
    startTransition(() => {
      addTransitionType(transitionTypes.navMode);
      setNavigationMode({ pathname, mode });
    });
  };

  const closeSearch = () => {
    restoreSearchFocusRef.current = true;
    if (isSearchRoute) {
      startSearchTransition(() => {
        setNavigationMode({ pathname: String(baseRoute), mode: "menu" });
        setQuery("");
        router.push(baseRoute as Route, {
          scroll: NAV_SHELL_SCROLL,
          transitionTypes: [transitionTypes.section],
        });
      });
      return;
    }
    startTransition(() => {
      addTransitionType(transitionTypes.navMode);
      setNavigationMode({ pathname, mode: "menu" });
      setQuery("");
    });
  };

  const openSearch = () => {
    startTransition(() => {
      addTransitionType(transitionTypes.navMode);
      if (!isSearchRoute) {
        setQuery("");
      }
      setNavigationMode({ pathname, mode: "search" });
    });
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

  return (
    <ViewTransition
      default="none"
      name="site-navigation"
      update={{
        default: "vt-anchor",
        [transitionTypes.navMode]: "vt-nav",
        [transitionTypes.section]: "vt-nav",
      }}
    >
      <GridCard
        aria-label="Main navigation"
        as="nav"
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 self-start",
          className
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape" && renderMode === "search") {
            event.preventDefault();
            closeSearch();
          } else if (event.key === "Escape" && renderMode === "menu") {
            event.preventDefault();
            changeMenuMode("hero");
          }
        }}
      >
        {
          {
            hero: (
              <HeroMode
                logoHref={baseRoute}
                routeContext={routeContext}
                setMenuMode={changeMenuMode}
              />
            ),
            menu: (
              <MenuMode
                openSearch={openSearch}
                routeContext={routeContext}
                setMenuMode={changeMenuMode}
              />
            ),
            search: (
              <SearchMode
                isPending={isSubmitting}
                onClose={closeSearch}
                onSubmit={handleSearchSubmit}
                query={query}
                setQuery={setQuery}
              />
            ),
          }[renderMode]
        }
      </GridCard>
    </ViewTransition>
  );
};

export { GridCardNavItem } from "./grid-card-nav-item";
