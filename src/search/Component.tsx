"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { searchHref, searchRoute, transitionTypes } from "@/utilities/routes";

export const Search: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [value, setValue] = useState(initialQuery);
  const [isPending, startSearchTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const navigate = () => {
    const trimmed = value.trim();
    const href = trimmed ? searchHref(trimmed) : searchRoute();

    startSearchTransition(() => {
      router.push(href, {
        transitionTypes: [transitionTypes.searchSubmit],
      });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate();
  };

  return (
    <div className={cn(className)}>
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Label className="sr-only" htmlFor="search">
          Search
        </Label>
        <Input
          aria-busy={isPending}
          autoFocus
          id="search"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search"
          value={value}
        />
        <Button
          aria-busy={isPending}
          className="rounded-lg"
          disabled={isPending}
          type="submit"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
