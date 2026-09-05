import type { LucideIcon } from "lucide-react";
import {
  BadgeInfo,
  BriefcaseBusiness,
  FileText,
  Languages,
  Mail,
  NotebookPen,
  Radio,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { ViewTransition } from "react";
import {
  aboutRoute,
  activitiesRoute,
  amRoute,
  contactRoute,
  lyovsonActivitiesRoute,
  lyovsonBioRoute,
  lyovsonContactRoute,
  lyovsonNotesRoute,
  lyovsonPortfolioRoute,
  lyovsonPostsRoute,
  notesRoute,
  postsRoute,
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
  const username = routeContext.username;
  const archiveLinks: MenuLink[] = [
    {
      href: username ? lyovsonPostsRoute(username) : postsRoute(),
      icon: FileText,
      label: "Posts",
    },
    {
      href: username ? lyovsonNotesRoute(username) : notesRoute(),
      icon: NotebookPen,
      label: "Notes",
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
    "surface-nav-tile col-start-3 col-end-4 row-start-1 row-end-2",
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
