import { Atom, Flower, House, LucideMenu } from "lucide-react";
import type { ReactNode } from "react";
import { homeRoute, lyovsonRoute } from "@/utilities/routes";
import { GridCardNavItem } from "./grid-card-nav-item";
import { SiteTitleSection } from "./site-title-section";
import type { ManualMenuMode, NavRouteContext } from "./types";

interface NavHeroLink {
  href: string;
  icon: ReactNode;
  label: string;
}

function HeroModeLink({
  className,
  link,
}: {
  className: string;
  link: NavHeroLink;
}) {
  return (
    <GridCardNavItem className={className} href={link.href} variant="link">
      {link.icon}
      <span>{link.label}</span>
    </GridCardNavItem>
  );
}

function getHeroLinks(routeContext: NavRouteContext): {
  left: NavHeroLink;
  right: NavHeroLink;
} {
  if (routeContext.mode !== "person" || !routeContext.username) {
    return {
      left: {
        href: lyovsonRoute("rafa"),
        icon: <Atom aria-hidden="true" className="h-7 w-7" />,
        label: "Rafa",
      },
      right: {
        href: lyovsonRoute("jess"),
        icon: <Flower aria-hidden="true" className="h-7 w-7" />,
        label: "Jess",
      },
    };
  }

  if (routeContext.username === "rafa") {
    return {
      left: {
        href: homeRoute(),
        icon: <House aria-hidden="true" className="h-7 w-7" />,
        label: "Home",
      },
      right: {
        href: lyovsonRoute("jess"),
        icon: <Flower aria-hidden="true" className="h-7 w-7" />,
        label: "Jess",
      },
    };
  }

  return {
    left: {
      href: lyovsonRoute("rafa"),
      icon: <Atom aria-hidden="true" className="h-7 w-7" />,
      label: "Rafa",
    },
    right: {
      href: homeRoute(),
      icon: <House aria-hidden="true" className="h-7 w-7" />,
      label: "Home",
    },
  };
}

export const HeroMode = ({
  logoHref,
  routeContext,
  setMenuMode,
}: {
  logoHref: string;
  routeContext: NavRouteContext;
  setMenuMode: (menuMode: ManualMenuMode) => void;
}) => {
  const links = getHeroLinks(routeContext);

  return (
    <>
      <SiteTitleSection href={logoHref} />

      <HeroModeLink
        className="surface-nav-tile col-start-1 col-end-2 row-start-3 row-end-4"
        link={links.left}
      />
      <GridCardNavItem
        className="surface-nav-tile col-start-2 col-end-3 row-start-3 row-end-4"
        onClick={() => {
          setMenuMode("menu");
        }}
        variant="button"
      >
        <LucideMenu aria-hidden="true" className="h-7 w-7" />
        <span>Menu</span>
      </GridCardNavItem>
      <HeroModeLink
        className="surface-nav-tile col-start-3 col-end-4 row-start-3 row-end-4"
        link={links.right}
      />
    </>
  );
};
