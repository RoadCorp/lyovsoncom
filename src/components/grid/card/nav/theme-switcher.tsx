"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { revealTheme } from "@/utilities/theme-reveal";
import { GridCardNavItem } from "./grid-card-nav-item";
import type { ResolvedTheme } from "./theme-utils";
import { getNextTheme, THEME_LABELS, toThemeChoice } from "./theme-utils";

interface ThemeSwitcherProps {
  className?: string;
}

// Says which mode is active, and keeps "follow the device" one press away.
export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { theme, setTheme, systemTheme } = useTheme();
  // The stored choice is only known in the browser; render the neutral
  // label on the server and first client render to avoid a mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = toThemeChoice(theme);
  const resolvedSystem: ResolvedTheme =
    systemTheme === "dark" ? "dark" : "light";
  const next = getNextTheme(current, resolvedSystem);

  return (
    <GridCardNavItem
      aria-label={
        mounted
          ? `Theme: ${THEME_LABELS[current]}. Switch to ${THEME_LABELS[next]}`
          : "Theme"
      }
      className={cn("col-start-3 col-end-4 row-start-3 row-end-4", className)}
      onClick={(event) =>
        revealTheme({
          apply: () => setTheme(next),
          origin: event.currentTarget,
          resolvedNext: next === "system" ? resolvedSystem : next,
        })
      }
      shortcut="T"
      variant="button"
    >
      <SunMoon aria-hidden="true" className="h-7 w-7" />
      <span className="text-sm">
        {mounted ? THEME_LABELS[current] : "Theme"}
      </span>
    </GridCardNavItem>
  );
};
