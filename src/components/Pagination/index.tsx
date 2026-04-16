import { ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import { transitionTypes } from "@/utilities/routes";

interface PaginationProps {
  className?: string;
  getPageHref: (pageNumber: number) => string;
  page: number;
  totalPages: number;
}

interface GridCell {
  ariaLabel?: string;
  disabled: boolean;
  isCurrent: boolean;
  key: string;
  label: number | null | ReactNode;
  target: number;
}

const MAX_WINDOW_SIZE = 7;
const WINDOW_RADIUS = Math.floor(MAX_WINDOW_SIZE / 2);

const cellPositions = [
  "col-start-1 col-end-2 row-start-1 row-end-2",
  "col-start-2 col-end-3 row-start-1 row-end-2",
  "col-start-3 col-end-4 row-start-1 row-end-2",
  "col-start-1 col-end-2 row-start-2 row-end-3",
  "col-start-2 col-end-3 row-start-2 row-end-3",
  "col-start-3 col-end-4 row-start-2 row-end-3",
  "col-start-1 col-end-2 row-start-3 row-end-4",
  "col-start-2 col-end-3 row-start-3 row-end-4",
  "col-start-3 col-end-4 row-start-3 row-end-4",
];

function buildWindow(page: number, totalPages: number): Array<number | null> {
  if (totalPages <= 0) {
    return new Array(MAX_WINDOW_SIZE).fill(null);
  }

  if (totalPages <= MAX_WINDOW_SIZE) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    return [...pages, ...new Array(MAX_WINDOW_SIZE - pages.length).fill(null)];
  }

  let start = Math.max(1, page - WINDOW_RADIUS);
  let end = start + MAX_WINDOW_SIZE - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - (MAX_WINDOW_SIZE - 1));
  }

  const pages: number[] = [];
  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  return pages;
}

function renderDisabledCell(cell: GridCell) {
  if (typeof cell.label === "number") {
    return (
      <span aria-current={cell.isCurrent ? "page" : undefined}>
        {cell.label}
      </span>
    );
  }

  return cell.label;
}

export function Pagination({
  className,
  getPageHref,
  page,
  totalPages,
}: PaginationProps) {
  const windowCells = [...buildWindow(page, totalPages)];

  while (windowCells.length < MAX_WINDOW_SIZE) {
    windowCells.push(null);
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const gridCells: GridCell[] = [
    {
      key: "first",
      label: <ChevronsLeft aria-hidden="true" className="h-5 w-5" />,
      ariaLabel: "Go to first page",
      disabled: !hasPrev,
      isCurrent: false,
      target: 1,
    },
    ...windowCells.map((value, index) => {
      if (value == null) {
        return {
          key: `empty-${index}`,
          label: null,
          disabled: true,
          isCurrent: false,
          target: page,
        };
      }

      return {
        key: `page-${value}`,
        label: value,
        ariaLabel: `Go to page ${value}`,
        disabled: value === page,
        isCurrent: value === page,
        target: value,
      };
    }),
    {
      key: "next",
      label: <ChevronsRight aria-hidden="true" className="h-5 w-5" />,
      ariaLabel: "Go to next page",
      disabled: !hasNext,
      isCurrent: false,
      target: page + 1,
    },
  ];

  return (
    <div className={cn("mx-auto flex justify-center", className)}>
      <GridCard interactive={false}>
        {gridCells.map((cell, index) => {
          const isNumeric = typeof cell.label === "number";
          const positionClass = cellPositions[index];

          if (!cell.label) {
            return (
              <GridCardSection
                aria-hidden="true"
                className={positionClass}
                key={cell.key}
              >
                <div />
              </GridCardSection>
            );
          }

          return (
            <GridCardSection
              className={cn(
                positionClass,
                "flex h-full w-full items-center justify-center text-lg",
                isNumeric && "font-semibold",
                cell.isCurrent && "surface-emphasis",
                cell.disabled && !cell.isCurrent && "opacity-45"
              )}
              key={cell.key}
            >
              {cell.disabled ? (
                renderDisabledCell(cell)
              ) : (
                <AppLink
                  aria-label={cell.ariaLabel}
                  className="relative flex h-full w-full items-center justify-center"
                  href={getPageHref(cell.target)}
                  pendingHintClassName="absolute right-2 top-2"
                  prefetch={null}
                  showPendingHint
                  transitionTypes={[
                    cell.target < page
                      ? transitionTypes.paginationPrev
                      : transitionTypes.paginationNext,
                  ]}
                >
                  {cell.label}
                </AppLink>
              )}
            </GridCardSection>
          );
        })}
      </GridCard>
    </div>
  );
}
