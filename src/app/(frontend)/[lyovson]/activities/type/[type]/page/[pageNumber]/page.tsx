import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { GridCardActivityLedger } from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import {
  ACTIVITY_FILTER_ARCHIVE_LABELS,
  ACTIVITY_FILTER_TYPES,
  isActivityFilterType,
} from "@/utilities/activity-type";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
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
import { LYOVSON_ITEMS_PER_PAGE } from "../../../../../_utilities/constants";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../../../../../_utilities/metadata";

export const prefetch = "partial";

interface PageProps {
  params: Promise<{ lyovson: string; pageNumber: string; type: string }>;
}

async function PageContent({ params }: PageProps) {
  const { lyovson: username, pageNumber: rawPageNumber, type } = await params;
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (pageNumber === null) {
    return notFound();
  }
  if (pageNumber === 1) {
    redirect(lyovsonActivitiesTypeRoute(username, type));
  }

  const [user, response, counts] = await Promise.all([
    getLyovsonProfile(username),
    getLyovsonActivitiesByType(
      username,
      type,
      pageNumber,
      LYOVSON_ITEMS_PER_PAGE
    ),
    getLyovsonActivityTypeCounts(username),
  ]);

  if (!(user && response && counts)) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;
  if (docs.length === 0 || pageNumber > totalPages) {
    return notFound();
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  const collectionPageSchema = generateCollectionPageSchema({
    name: `${user.name} — ${label} — Page ${pageNumber}`,
    description: `${label} activities logged by ${user.name} — Page ${pageNumber}.`,
    url: absoluteUrl(
      lyovsonActivitiesTypePageRoute(username, type, pageNumber)
    ),
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
    {
      name: label,
      url: absoluteUrl(lyovsonActivitiesTypeRoute(username, type)),
    },
    { name: `Page ${pageNumber}` },
  ]);

  return (
    <>
      <h1 className="sr-only">
        {user.name} — {label} — Page {pageNumber}
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
      <ActivitiesArchive activities={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(nextPage) =>
            lyovsonActivitiesTypePageRoute(username, type, nextPage)
          }
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("static");

  const params: Array<{ lyovson: string; pageNumber: string; type: string }> =
    [];
  for (const lyovson of PRIMARY_LYOVSONS) {
    const counts = await getLyovsonActivityTypeCounts(lyovson);
    if (!counts) {
      continue;
    }
    for (const type of ACTIVITY_FILTER_TYPES) {
      for (const pageNumber of getPaginatedStaticParams(
        counts[type] ?? 0,
        LYOVSON_ITEMS_PER_PAGE
      )) {
        params.push({ lyovson, pageNumber, type });
      }
    }
  }

  return ensureStaticParams(params, {
    lyovson: PRIMARY_LYOVSONS[0],
    pageNumber: "__placeholder__",
    type: "read",
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username, pageNumber: rawPageNumber, type } = await params;
  const pageNumber = parsePageNumber(rawPageNumber);

  if (!(isActivityFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildLyovsonNotFoundMetadata();
  }

  const [user, response] = await Promise.all([
    getLyovsonProfile(username),
    getLyovsonActivitiesByType(
      username,
      type,
      pageNumber,
      LYOVSON_ITEMS_PER_PAGE
    ),
  ]);

  if (!(user && response) || response.docs.length === 0) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = user.name || username;
  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildLyovsonMetadata({
    title: `${name} ${label} - Page ${pageNumber}`,
    description: `Browse ${label.toLowerCase()} activities logged by ${name} - Page ${pageNumber}.`,
    canonicalPath: lyovsonActivitiesTypePageRoute(username, type, pageNumber),
    prevPath: lyovsonActivitiesTypePageRoute(username, type, pageNumber - 1),
    nextPath:
      pageNumber < response.totalPages
        ? lyovsonActivitiesTypePageRoute(username, type, pageNumber + 1)
        : undefined,
    robots:
      pageNumber > MAX_INDEXED_PAGE
        ? { index: false, follow: true }
        : undefined,
  });
}

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
