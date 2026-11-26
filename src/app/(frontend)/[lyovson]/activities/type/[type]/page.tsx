import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { GridCardActivityLedger, GridCardEmptyState } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  ACTIVITY_FILTER_ARCHIVE_LABELS,
  ACTIVITY_FILTER_TYPES,
  isActivityFilterType,
} from "@/utilities/activity-type";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import {
  getLyovsonActivitiesByType,
  getLyovsonActivityTypeCounts,
} from "@/utilities/get-activity";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import {
  absoluteUrl,
  activityUrl,
  homeRoute,
  lyovsonActivitiesRoute,
  lyovsonActivitiesTypePageRoute,
  lyovsonActivitiesTypeRoute,
  lyovsonRoute,
  PRIMARY_LYOVSONS,
} from "@/utilities/routes";
import { LYOVSON_ITEMS_PER_PAGE } from "../../../_utilities/constants";
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
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const [user, response, counts] = await Promise.all([
    getLyovsonProfile(username),
    getLyovsonActivitiesByType(username, type, 1, LYOVSON_ITEMS_PER_PAGE),
    getLyovsonActivityTypeCounts(username),
  ]);

  if (!(user && response && counts)) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;
  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} — ${label}`,
    description: `${label} activities logged by ${user.name}.`,
    url: absoluteUrl(lyovsonActivitiesTypeRoute(username, type)),
    itemCount: totalDocs,
    items: docs
      .map((activity) => {
        const url = activityUrl(activity);
        return url ? { url } : null;
      })
      .filter((item): item is { url: string } => item !== null),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: user.name, url: absoluteUrl(lyovsonRoute(username)) },
    { name: "Activities", url: absoluteUrl(lyovsonActivitiesRoute(username)) },
    { name: label },
  ]);

  return (
    <>
      <h1 className="sr-only">
        {user.name} — {label}
      </h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <GridCardActivityLedger
        activeType={type}
        baseHref={lyovsonActivitiesRoute(username)}
        counts={counts}
        getTypeHref={(nextType) =>
          lyovsonActivitiesTypeRoute(username, nextType)
        }
      />
      {docs.length > 0 ? (
        <ActivitiesArchive activities={docs} />
      ) : (
        <GridCardEmptyState
          description={`No ${label.toLowerCase()} activities logged for ${user.name} yet.`}
          title={`No ${label} Yet`}
        />
      )}
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) =>
            lyovsonActivitiesTypePageRoute(username, type, pageNumber)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
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
  if (!isActivityFilterType(type)) {
    return buildLyovsonNotFoundMetadata();
  }

  const user = await getLyovsonProfile(username);
  if (!user) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = user.name || username;
  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildLyovsonMetadata({
    title: `${name} ${label}`,
    description: `Browse ${label.toLowerCase()} activities logged by ${name}.`,
    canonicalPath: lyovsonActivitiesTypeRoute(username, type),
  });
}

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
