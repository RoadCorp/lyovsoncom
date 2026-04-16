import { X } from "lucide-react";
import { GridCardNavItem } from "./grid-card-nav-item";
import { SearchInput } from "./search-input";
import { SiteTitleSection } from "./site-title-section";

export const SearchMode = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <SiteTitleSection />
      <GridCardNavItem
        className={
          "surface-nav-tile col-start-1 col-end-2 row-start-3 row-end-4"
        }
        onClick={onClose}
        variant="button"
      >
        <X className="h-7 w-7" />
        <span>Close</span>
      </GridCardNavItem>
      <SearchInput className="surface-nav-tile col-start-2 col-end-4 row-start-3 row-end-4" />
    </>
  );
};
