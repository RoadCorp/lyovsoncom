import type { LucideIcon } from "lucide-react";
import {
  BadgeInfo,
  BriefcaseBusiness,
  Languages,
  Mail,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  aboutRoute,
  amRoute,
  contactRoute,
  lyovsonBioRoute,
  lyovsonContactRoute,
  lyovsonPortfolioRoute,
} from "@/utilities/routes";
import { GridCardNavItem } from "./grid-card-nav-item";
import { ThemeSwitcher } from "./theme-switcher";
import type { ManualMenuMode, NavRouteContext } from "./types";

interface MenuLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

function getMenuLinks(routeContext: NavRouteContext): MenuLink[] {
  if (routeContext.mode === "person" && routeContext.username) {
    return [
      {
        href: lyovsonBioRoute(routeContext.username),
        icon: UserRound,
        label: "Bio",
      },
      {
        href: lyovsonPortfolioRoute(routeContext.username),
        icon: BriefcaseBusiness,
        label: "Portfolio",
      },
      {
        href: lyovsonContactRoute(routeContext.username),
        icon: Mail,
        label: "Contact",
      },
    ];
  }

  return [
    {
      href: aboutRoute(),
      icon: BadgeInfo,
      label: "About",
    },
    {
      href: amRoute(),
      icon: Languages,
      label: "AM",
    },
    {
      href: contactRoute(),
      icon: Mail,
      label: "Contact",
    },
  ];
}

export const MenuMode = ({
  openSearch,
  routeContext,
  setMenuMode,
}: {
  openSearch: () => void;
  routeContext: NavRouteContext;
  setMenuMode: (menuMode: ManualMenuMode) => void;
}) => {
  const menuLinks = getMenuLinks(routeContext);
  const menuClasses = [
    "surface-nav-tile col-start-1 col-end-2 row-start-2 row-end-3",
    "surface-nav-tile col-start-2 col-end-3 row-start-2 row-end-3",
    "surface-nav-tile col-start-3 col-end-4 row-start-2 row-end-3",
  ] as const;

  return (
    <>
      {menuLinks.map((link, index) => (
        <GridCardNavItem
          className={menuClasses[index]}
          href={link.href}
          key={link.href}
          variant="link"
        >
          <link.icon aria-hidden="true" className="h-7 w-7" />
          <span>{link.label}</span>
        </GridCardNavItem>
      ))}
      <GridCardNavItem
        className="surface-nav-tile col-start-1 col-end-2 row-start-3 row-end-4"
        onClick={openSearch}
        variant="button"
      >
        <Search aria-hidden="true" className="h-7 w-7" />
        <span>Search</span>
      </GridCardNavItem>
      <GridCardNavItem
        className="surface-nav-tile col-start-2 col-end-3 row-start-3 row-end-4"
        onClick={() => setMenuMode("hero")}
        variant="button"
      >
        <X aria-hidden="true" className="h-7 w-7" />
        <span>Close</span>
      </GridCardNavItem>
      <ThemeSwitcher />
    </>
  );
};
