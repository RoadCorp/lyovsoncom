import type { Metadata } from "next/types";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  getLyovsonActivityTypeMetadata,
  getLyovsonActivityTypePaginatedStaticParams,
  renderLyovsonActivityTypeArchive,
} from "@/utilities/create-filtered-archive-page";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../../../../../_utilities/metadata";

export const prefetch = "partial";

interface PageProps {
  params: Promise<{ lyovson: string; pageNumber: string; type: string }>;
}

async function PageContent({ params }: PageProps) {
  const { lyovson: username, pageNumber, type } = await params;
  return renderLyovsonActivityTypeArchive({
    rawPageNumber: pageNumber,
    type,
    username,
  });
}

export function generateStaticParams() {
  return getLyovsonActivityTypePaginatedStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username, pageNumber, type } = await params;
  return getLyovsonActivityTypeMetadata({
    buildMetadata: buildLyovsonMetadata,
    buildNotFound: buildLyovsonNotFoundMetadata,
    rawPageNumber: pageNumber,
    type,
    username,
  });
}

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
