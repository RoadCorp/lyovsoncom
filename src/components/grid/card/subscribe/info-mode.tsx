import { Info, X } from "lucide-react";
import { GridCardSection } from "@/components/grid";
import { GridCardNavItem } from "@/components/grid/card/nav";
import type { SubscribeMode } from "./types";

interface InfoModeProps {
  message: string;
  setMode: (mode: SubscribeMode) => void;
}

export const InfoMode = ({ message, setMode }: InfoModeProps) => {
  return (
    <>
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-4 text-center">
        <Info
          aria-label="Information"
          className="glass-semantic-info h-16 w-16"
        />
        <h2 className="glass-semantic-info font-bold text-2xl">Note</h2>
        <p className="glass-text-secondary text-base">{message}</p>
      </GridCardSection>

      <GridCardNavItem
        className="col-start-2 col-end-3 row-start-3 row-end-4"
        onClick={() => {
          setMode("form");
        }}
        variant="button"
      >
        <X className="h-7 w-7" />
        <span>Close</span>
      </GridCardNavItem>
    </>
  );
};
