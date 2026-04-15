"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GridCard } from "@/components/grid";
import { cn } from "@/lib/utils";
import { HeroMode } from "./hero-mode";
import { MenuMode } from "./menu-mode";
import { SearchMode } from "./search-mode";
import { SettingsMode } from "./settings-mode";
import type { ManualMenuMode, MenuModeType } from "./types";

export const GridCardNav = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasActiveSearch = Boolean(searchParams.get("q")?.trim());
  const [menuMode, setMenuMode] = useState<ManualMenuMode>("hero");
  const [showSearch, setShowSearch] = useState(hasActiveSearch);

  useEffect(() => {
    if (!hasActiveSearch) {
      setShowSearch(false);
    }
  }, [hasActiveSearch]);

  const renderMode: MenuModeType =
    hasActiveSearch || showSearch ? "search" : menuMode;

  const closeSearch = () => {
    if (!hasActiveSearch) {
      setShowSearch(false);
      setMenuMode("hero");
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("q");

    setShowSearch(false);
    setMenuMode("hero");

    const nextQueryString = nextSearchParams.toString();

    if (nextQueryString) {
      router.push(`${pathname}?${nextQueryString}` as Route);
      return;
    }

    router.push(pathname as Route);
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
              openSearch={() => setShowSearch(true)}
              setMenuMode={setMenuMode}
            />
          ),
          search: <SearchMode onClose={closeSearch} />,
          menu: <MenuMode setMenuMode={setMenuMode} />,
          settings: <SettingsMode setMenuMode={setMenuMode} />,
        }[renderMode]
      }
    </GridCard>
  );
};

export { GridCardNavItem } from "./grid-card-nav-item";
