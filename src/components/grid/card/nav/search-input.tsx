"use client";

import { LoaderCircle, SearchIcon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GridCardNavItem } from "./grid-card-nav-item";

export const SearchInput = ({
  className,
  isPending,
  onSubmit,
  setValue,
  value,
}: {
  className?: string;
  isPending?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setValue: (value: string) => void;
  value: string;
}) => {
  return (
    <GridCardNavItem className={cn(className)} variant="static">
      <form className="flex items-center gap-2" onSubmit={onSubmit}>
        <Label className="sr-only" htmlFor="nav-search">
          Search
        </Label>
        <Input
          aria-busy={isPending}
          autoFocus
          id="nav-search"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search"
          value={value}
        />
        <Button
          aria-busy={isPending}
          aria-label="Submit search"
          className="rounded-lg"
          disabled={isPending}
          title="Submit search"
          type="submit"
        >
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <SearchIcon aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
      </form>
    </GridCardNavItem>
  );
};
