import { PublicPageFallback } from "@/components/PublicPageBoundary";

export default function Loading() {
  return <PublicPageFallback skeleton="post" />;
}
