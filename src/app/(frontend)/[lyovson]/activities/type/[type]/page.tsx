import type { Metadata } from "next/types";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { ACTIVITY_FILTER_TYPES } from "@/utilities/activity-type";
import {
  getLyovsonActivityTypeMetadata,
  renderLyovsonActivityTypeArchive,
} from "@/utilities/create-filtered-archive-page";
import { PRIMARY_LYOVSONS } from "@/utilities/routes";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../../../_utilities/metadata";

export const prefetch = "partial";

interface PageProps {
  params: Promise<{ lyovson: string; type: string }>;
}

async function PageContent({ params }: PageProps) {
  const { lyovson: username, type } = await params;
  return renderLyovsonActivityTypeArchive({ type, username });
}

export function generateStaticParams() {
  return PRIMARY_LYOVSONS.flatMap((lyovson) =>
    ACTIVITY_FILTER_TYPES.map((type) => ({ lyovson, type }))
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username, type } = await params;
  return getLyovsonActivityTypeMetadata({
    buildMetadata: buildLyovsonMetadata,
    buildNotFound: buildLyovsonNotFoundMetadata,
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
