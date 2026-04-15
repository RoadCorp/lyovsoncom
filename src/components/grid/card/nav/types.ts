export type MenuModeType = "hero" | "search" | "menu" | "settings";
export type ManualMenuMode = Exclude<MenuModeType, "search">;
