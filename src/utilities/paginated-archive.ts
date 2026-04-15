import type { Metadata } from "next/types";
import { MAX_INDEXED_PAGE, parsePageNumber } from "@/utilities/archive";
import { getServerSideURL } from "@/utilities/getURL";

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

interface BuildPaginatedArchiveMetadataArgs {
  canonicalPath: string;
  description: string;
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
  pageNumber,
  title,
}: BuildPaginatedArchiveMetadataArgs): Metadata {
  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title,
      description,
      type: "website",
      url: canonicalPath,
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@lyovson",
    },
    robots: {
      index: pageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: pageNumber > 1,
    },
  };
}
