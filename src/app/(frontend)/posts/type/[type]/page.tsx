import type { Metadata } from "next/types";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  getPostTypeMetadata,
  renderPostTypeArchive,
} from "@/utilities/create-filtered-archive-page";
import { POST_FILTER_TYPES } from "@/utilities/post-type";

export const prefetch = "partial";

interface Args {
  params: Promise<{
    type: string;
  }>;
}

async function PageContent({ params }: Args) {
  const { type } = await params;
  return renderPostTypeArchive({ type });
}

export function generateStaticParams() {
  return POST_FILTER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { type } = await params;
  return getPostTypeMetadata({ type });
}

export default function Page(props: Args) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
