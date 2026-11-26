import type { ReactNode } from "react";
import { GridCardSection } from "@/components/grid/card/section";
import { GRID_HERO_PANELS } from "@/components/grid/layout";
import { BraidedFrieze, CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";

export const LONG_HERO_TITLE = 50;
const VERY_LONG_HERO_TITLE = 80;

/**
 * The hero title panel has a fixed height, so long titles step down a size
 * instead of overflowing it (they are page headings, so they aren't clamped).
 */
export function heroTitleSize(title: string | null | undefined) {
  const length = title?.length ?? 0;
  if (length > VERY_LONG_HERO_TITLE) {
    return "text-lg leading-snug md:text-xl";
  }
  if (length > LONG_HERO_TITLE) {
    return "text-[1.5rem] leading-[1.18] md:text-[1.625rem]";
  }
  return "text-[1.625rem] leading-[1.12] md:text-[2rem]";
}

interface HeroStageProps {
  children: ReactNode;
  className?: string;
  cornerClassName?: string;
  cornerInset?: "sm" | "md";
  cornerVariant?: "ticks" | "triquetra";
}

/** Shared right/bottom title-stage panel for 2×1 / 1×2 hero cards. */
export function HeroStage({
  children,
  className,
  cornerClassName = "ornament-corner--rest",
  cornerInset,
  cornerVariant = "ticks",
}: HeroStageProps) {
  return (
    <GridCardSection
      className={cn("surface-title-stage", GRID_HERO_PANELS.stage, className)}
    >
      <BraidedFrieze />
      <CornerKnots
        className={cornerClassName}
        edges="bottom"
        inset={cornerInset}
        variant={cornerVariant}
      />
      {children}
    </GridCardSection>
  );
}
