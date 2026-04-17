"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { GridCardNavItem } from "./grid-card-nav-item";

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <GridCardNavItem
      className={cn("col-start-3 col-end-4 row-start-3 row-end-4", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      variant="button"
    >
      <SunMoon aria-hidden="true" className="h-7 w-7" />
      <span className="font-medium text-sm">Theme</span>
    </GridCardNavItem>
  );
};
