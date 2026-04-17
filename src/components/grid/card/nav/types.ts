export type MenuModeType = "hero" | "search" | "menu";
export type ManualMenuMode = Exclude<MenuModeType, "search">;

export interface NavRouteContext {
  mode: "global" | "person";
  username: string | null;
}
