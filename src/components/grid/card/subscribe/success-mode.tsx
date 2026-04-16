import { CheckCircle2, X } from "lucide-react";
import { GridCardSection } from "@/components/grid";
import { GridCardNavItem } from "@/components/grid/card/nav";
import type { SubscribeMode } from "./types";

interface SuccessModeProps {
  message: string;
  setMode: (mode: SubscribeMode) => void;
}

export const SuccessMode = ({ message, setMode }: SuccessModeProps) => {
  return (
    <>
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2
          aria-label="Success"
          className="state-success h-16 w-16"
        />
        <h2 className="state-success font-bold text-2xl">Success!</h2>
        <p className="tone-muted text-base">{message}</p>
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
