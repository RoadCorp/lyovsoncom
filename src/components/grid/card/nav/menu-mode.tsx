import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  BriefcaseBusiness,
  Compass,
  FileText,
  Mail,
  Radio,
  Search,
  Tags,
  UserRound,
  X,
} from "lucide-react";
import { ViewTransition } from "react";
import { EternityKnot } from "@/components/ornaments";
import {
  aboutRoute,
  activitiesRoute,
  lyovsonActivitiesRoute,
  lyovsonBioRoute,
  lyovsonContactRoute,
  lyovsonPortfolioRoute,
  lyovsonPostsRoute,
  nowRoute,
  postsRoute,
  projectsRoute,
  topicsRoute,
} from "@/utilities/routes";
import { GridCardSection } from "../section";
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
      href: projectsRoute(),
      icon: BriefcaseBusiness,
      label: "Projects",
    },
    {
      href: topicsRoute(),
      icon: Tags,
      label: "Topics",
    },
    {
      href: aboutRoute(),
      icon: BookOpenText,
      label: "About",
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
  const username = routeContext.username;
  const archiveLinks: MenuLink[] = [
    {
      href: username ? lyovsonPostsRoute(username) : postsRoute(),
      icon: FileText,
      label: "Posts",
    },
    {
      href: username ? lyovsonActivitiesRoute(username) : activitiesRoute(),
      icon: Radio,
      label: "Activities",
    },
  ];
  const menuLinks = getMenuLinks(routeContext);
  const archiveClasses = [
    "surface-nav-tile col-start-1 col-end-2 row-start-1 row-end-2",
    "surface-nav-tile col-start-2 col-end-3 row-start-1 row-end-2",
  ] as const;
  const menuClasses = [
    "surface-nav-tile col-start-1 col-end-2 row-start-2 row-end-3",
    "surface-nav-tile col-start-2 col-end-3 row-start-2 row-end-3",
    "surface-nav-tile col-start-3 col-end-4 row-start-2 row-end-3",
  ] as const;

  return (
    <>
      {archiveLinks.map((link, index) => (
        <GridCardNavItem
          className={archiveClasses[index]}
          href={link.href}
          id={index === 0 ? "nav-first-link" : undefined}
          key={link.href}
          variant="link"
        >
          <link.icon aria-hidden="true" className="h-7 w-7" />
          <span>{link.label}</span>
        </GridCardNavItem>
      ))}
      {routeContext.mode === "global" ? (
        <GridCardNavItem
          className="surface-nav-tile col-start-3 col-end-4 row-start-1 row-end-2"
          href={nowRoute()}
          variant="link"
        >
          <Compass aria-hidden="true" className="h-7 w-7" />
          <span>Now</span>
        </GridCardNavItem>
      ) : (
        <GridCardSection
          aria-hidden="true"
          className="surface-nav-tile relative col-start-3 col-end-4 row-start-1 row-end-2 flex items-center justify-center"
        >
          <div className="ornament-lattice" />
          <EternityKnot className="ornament-muted relative z-1" size={22} />
        </GridCardSection>
      )}
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
        id="nav-search-trigger"
        onClick={openSearch}
        shortcut="/"
        variant="button"
      >
        <ViewTransition
          default="none"
          name="nav-search-icon"
          share="vt-control"
        >
          <span className="inline-flex">
            <Search aria-hidden="true" className="h-7 w-7" />
          </span>
        </ViewTransition>
        <span>Search</span>
      </GridCardNavItem>
      <ViewTransition
        default="none"
        name="nav-close-control"
        share="vt-control"
      >
        <GridCardNavItem
          className="surface-nav-tile col-start-2 col-end-3 row-start-3 row-end-4"
          onClick={() => setMenuMode("hero")}
          shortcut="M"
          variant="button"
        >
          <X aria-hidden="true" className="h-7 w-7" />
          <span>Close</span>
        </GridCardNavItem>
      </ViewTransition>
      <ThemeSwitcher className="surface-nav-tile" />
    </>
  );
};
