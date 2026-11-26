import type { Metadata } from "next/types";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  getActivityTypeMetadata,
  getActivityTypePaginatedStaticParams,
  renderActivityTypeArchive,
} from "@/utilities/create-filtered-archive-page";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    pageNumber: string;
    type: string;
  }>;
}

async function PageContent({ params }: Args) {
  const { pageNumber, type } = await params;
  return renderActivityTypeArchive({ rawPageNumber: pageNumber, type });
}

export function generateStaticParams() {
  return getActivityTypePaginatedStaticParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { pageNumber, type } = await params;
  return getActivityTypeMetadata({ rawPageNumber: pageNumber, type });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
