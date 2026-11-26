"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  addTransitionType,
  Suspense,
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
  ViewTransition,
} from "react";
import { GridCard } from "@/components/grid/card";
import {
  homeRoute,
  lyovsonRoute,
  PRIMARY_LYOVSONS,
  searchHref,
  transitionTypes,
} from "@/utilities/routes";
import { revealTheme } from "@/utilities/theme-reveal";
import { HeroMode } from "./hero-mode";
import { MenuMode } from "./menu-mode";
import { SearchMode } from "./search-mode";
import type { ResolvedTheme } from "./theme-utils";
import { getNextTheme, toThemeChoice } from "./theme-utils";
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

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest('[contenteditable="true"], [role="textbox"]'));
}

interface ShortcutHandlers {
  changeMenuMode: (mode: ManualMenuMode) => void;
  openSearch: () => void;
  renderMode: MenuModeType;
  setTheme: (theme: string) => void;
  systemTheme: string | undefined;
  theme: string | undefined;
}

function cycleThemeFromShortcut(state: ShortcutHandlers) {
  const current = toThemeChoice(state.theme);
  const resolvedSystem: ResolvedTheme =
    state.systemTheme === "dark" ? "dark" : "light";
  const next = getNextTheme(current, resolvedSystem);
  const origin =
    document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]') ??
    document.documentElement;
  revealTheme({
    apply: () => state.setTheme(next),
    origin,
    resolvedNext: next === "system" ? resolvedSystem : next,
  });
}

function dispatchGlobalNavShortcut(
  event: KeyboardEvent,
  state: ShortcutHandlers
) {
  if (event.defaultPrevented || event.isComposing) {
    return;
  }

  const key = event.key.toLowerCase();
  const hasCommandModifier = event.metaKey || event.ctrlKey;

  if (hasCommandModifier && !event.altKey && key === "k") {
    event.preventDefault();
    state.openSearch();
    return;
  }

  if (
    hasCommandModifier ||
    event.altKey ||
    event.shiftKey ||
    isEditableElement(event.target)
  ) {
    return;
  }

  if (key === "/") {
    event.preventDefault();
    state.openSearch();
    return;
  }

  if (key === "m" && state.renderMode !== "search") {
    event.preventDefault();
    state.changeMenuMode(state.renderMode === "menu" ? "hero" : "menu");
    return;
  }

  if (key === "t") {
    event.preventDefault();
    cycleThemeFromShortcut(state);
  }
}

export const GridCardNav = ({ className }: { className?: string }) => (
  <Suspense
    fallback={
      <Navigation
        activeQuery=""
        className={className}
        interactive={false}
        pathname="/"
      />
    }
  >
    <RouteNavigation className={className} />
  </Suspense>
);

function RouteNavigation({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <Navigation
      activeQuery={searchParams.get("q")?.trim() || ""}
      className={className}
      pathname={pathname}
    />
  );
}

function Navigation({
  className,
  pathname,
  activeQuery,
  interactive = true,
}: {
  className?: string;
  pathname: string;
  activeQuery: string;
  interactive?: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const routeContext = getNavRouteContext(pathname);
  const baseRoute = getBaseRoute(routeContext);
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
      document.querySelector<HTMLElement>("#nav-search-trigger")?.focus();
    } else if (restoreMenuFocusRef.current) {
      restoreMenuFocusRef.current = false;
      document
        .querySelector<HTMLElement>(
          renderMode === "menu" ? "#nav-first-link" : "#nav-menu-trigger"
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

  const shortcutStateRef = useRef({
    changeMenuMode,
    openSearch,
    renderMode,
    setTheme,
    systemTheme,
    theme,
  });
  shortcutStateRef.current = {
    changeMenuMode,
    openSearch,
    renderMode,
    setTheme,
    systemTheme,
    theme,
  };

  useEffect(() => {
    if (!(interactive && ready)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      dispatchGlobalNavShortcut(event, shortcutStateRef.current);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [interactive, ready]);

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
        className={className}
        onKeyDownCapture={(event) => {
          if (event.key === "Escape" && renderMode === "search") {
            event.preventDefault();
            closeSearch();
          } else if (event.key === "Escape" && renderMode === "menu") {
            event.preventDefault();
            changeMenuMode("hero");
          }
        }}
        slot="nav"
      >
        {
          {
            hero: (
              <HeroMode
                disabled={!(interactive && ready)}
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
}

export { GridCardNavItem } from "./grid-card-nav-item";
