"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { GridCardNavItem } from "./grid-card-nav-item";

interface ThemeSwitcherProps {
  className?: string;
}

const THEME_ORDER = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof THEME_ORDER)[number];

const THEME_LABELS: Record<ThemeChoice, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

function toThemeChoice(theme: string | undefined): ThemeChoice {
  return THEME_ORDER.includes(theme as ThemeChoice)
    ? (theme as ThemeChoice)
    : "system";
}

type ResolvedTheme = "dark" | "light";

const opposite = (value: ResolvedTheme): ResolvedTheme =>
  value === "dark" ? "light" : "dark";

/**
 * From Auto the first press always flips what's on screen, the second flips
 * it back explicitly, and the third returns to following the device.
 */
function getNextTheme(
  current: ThemeChoice,
  systemTheme: ResolvedTheme
): ThemeChoice {
  if (current === "system") {
    return opposite(systemTheme);
  }
  if (current === opposite(systemTheme)) {
    return systemTheme;
  }
  return "system";
}

// Says which mode is active, and keeps "follow the device" one press away.
export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { theme, setTheme, systemTheme } = useTheme();
  // The stored choice is only known in the browser; render the neutral
  // label on the server and first client render to avoid a mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = toThemeChoice(theme);
  const next = getNextTheme(current, systemTheme === "dark" ? "dark" : "light");

  return (
    <GridCardNavItem
      aria-label={
        mounted
          ? `Theme: ${THEME_LABELS[current]}. Switch to ${THEME_LABELS[next]}`
          : "Theme"
      }
      className={cn("col-start-3 col-end-4 row-start-3 row-end-4", className)}
      onClick={() => setTheme(next)}
      variant="button"
    >
      <SunMoon aria-hidden="true" className="h-7 w-7" />
      <span className="text-sm">
        {mounted ? THEME_LABELS[current] : "Theme"}
      </span>
    </GridCardNavItem>
  );
};
