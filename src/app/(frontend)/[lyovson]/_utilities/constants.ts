import { parsePageNumber } from "@/utilities/archive";

export {
  LYOVSON_ITEMS_PER_PAGE,
  MAX_INDEXED_PAGE,
} from "@/utilities/archive";

export function getValidPageNumber(pageNumber: string) {
  return parsePageNumber(pageNumber);
}
