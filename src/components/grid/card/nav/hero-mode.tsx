import { LucideMenu, Search, Settings } from "lucide-react";

import { GridCardNavItem } from "./grid-card-nav-item";
import { SiteTitleSection } from "./site-title-section";
import type { ManualMenuMode } from "./types";

export const HeroMode = ({
  openSearch,
  setMenuMode,
}: {
  openSearch: () => void;
  setMenuMode: (menuMode: ManualMenuMode) => void;
}) => {
  return (
    <>
      <SiteTitleSection />

      <GridCardNavItem
        className="col-start-1 col-end-2 row-start-3 row-end-4"
        onClick={openSearch}
        variant="button"
      >
        <Search className="h-7 w-7" />
        <span>Search</span>
      </GridCardNavItem>
      <GridCardNavItem
        className="col-start-2 col-end-3 row-start-3 row-end-4"
        onClick={() => {
          setMenuMode("menu");
        }}
        variant="button"
      >
        <LucideMenu className="h-7 w-7" />
        <span>Menu</span>
      </GridCardNavItem>
      <GridCardNavItem
        className="col-start-3 col-end-4 row-start-3 row-end-4"
        onClick={() => {
          setMenuMode("settings");
        }}
        variant="button"
      >
        <Settings className="h-7 w-7" />
        <span>Settings</span>
      </GridCardNavItem>
    </>
  );
};
