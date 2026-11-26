import type { Metadata } from "next/types";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { ACTIVITY_FILTER_TYPES } from "@/utilities/activity-type";
import {
  getActivityTypeMetadata,
  renderActivityTypeArchive,
} from "@/utilities/create-filtered-archive-page";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    type: string;
  }>;
}

async function PageContent({ params }: Args) {
  const { type } = await params;
  return renderActivityTypeArchive({ type });
}

export function generateStaticParams() {
  return ACTIVITY_FILTER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type } = await params;
  return getActivityTypeMetadata({ type });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
