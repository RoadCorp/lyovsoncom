export const THEME_ORDER = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_ORDER)[number];
export type ResolvedTheme = "dark" | "light";

export const THEME_LABELS: Record<ThemeChoice, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

export function toThemeChoice(theme: string | undefined): ThemeChoice {
  return THEME_ORDER.includes(theme as ThemeChoice)
    ? (theme as ThemeChoice)
    : "system";
}

const opposite = (value: ResolvedTheme): ResolvedTheme =>
  value === "dark" ? "light" : "dark";

/**
 * From Auto the first press always flips what's on screen, the second flips
 * it back explicitly, and the third returns to following the device.
 */
export function getNextTheme(
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
