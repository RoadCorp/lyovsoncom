import type { Metadata } from "next/types";
import { MAX_INDEXED_PAGE, parsePageNumber } from "@/utilities/archive";
import { buildSeoMetadata, type SeoImageInput } from "@/utilities/seo-metadata";

export type PaginatedArchivePageState =
  | {
      kind: "notFound";
    }
  | {
      kind: "redirect";
    }
  | {
      kind: "page";
      pageNumber: number;
    };

export interface BuildPaginatedArchiveMetadataArgs {
  canonicalPath: string;
  description: string;
  /** A dedicated social image; also switches to the large Twitter card. */
  image?: SeoImageInput;
  keywords?: string[];
  pageNumber: number;
  title: string;
}

export function getPaginatedArchivePageState(
  pageNumber: number | string
): PaginatedArchivePageState {
  const parsedPageNumber = parsePageNumber(pageNumber);

  if (parsedPageNumber == null) {
    return { kind: "notFound" };
  }

  if (parsedPageNumber === 1) {
    return { kind: "redirect" };
  }

  return {
    kind: "page",
    pageNumber: parsedPageNumber,
  };
}

export function isPaginatedArchivePageOutOfRange(
  pageNumber: number,
  totalPages: number
) {
  return totalPages < 2 || pageNumber > totalPages;
}

export function buildPaginatedArchiveMetadata({
  canonicalPath,
  description,
  image,
  keywords,
  pageNumber,
  title,
}: BuildPaginatedArchiveMetadataArgs): Metadata {
  return buildSeoMetadata({
    title,
    description,
    canonicalPath,
    image,
    keywords,
    twitterCard: image ? "summary_large_image" : "summary",
    robots: {
      index: pageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: pageNumber > 1,
    },
  });
}
