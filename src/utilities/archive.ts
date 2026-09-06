const DEFAULT_ARCHIVE_PAGE_SIZE = 25;

export const POSTS_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const NOTES_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const ACTIVITIES_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const PROJECT_POSTS_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const TOPIC_POSTS_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const LYOVSON_ITEMS_PER_PAGE = DEFAULT_ARCHIVE_PAGE_SIZE;
export const MAX_INDEXED_PAGE = 3;

const PAGE_NUMBER_PATTERN = /^\d+$/;

export function parsePageNumber(value: number | string): number | null {
  if (typeof value === "string" && !PAGE_NUMBER_PATTERN.test(value)) {
    return null;
  }

  const pageNumber = Number(value);

  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    return null;
  }

  return pageNumber;
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) {
    return 0;
  }

  return Math.ceil(totalItems / pageSize);
}

export function getIndexedPaginationPages(
  totalItems: number,
  pageSize: number
): number[] {
  const totalPages = getTotalPages(totalItems, pageSize);
  const maxPage = Math.min(totalPages, MAX_INDEXED_PAGE);
  const pages: number[] = [];

  for (let pageNumber = 2; pageNumber <= maxPage; pageNumber += 1) {
    pages.push(pageNumber);
  }

  return pages;
}

export function getPaginatedStaticParams(
  totalItems: number,
  pageSize: number
): string[] {
  const totalPages = getTotalPages(totalItems, pageSize);
  const params: string[] = [];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    params.push(String(pageNumber));
  }

  return params;
}
