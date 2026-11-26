import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import type { ReactNode } from "react";
import { ActivitiesArchive } from "@/components/ActivitiesArchive";
import { CollectionArchive } from "@/components/CollectionArchive";
import {
  GridCardActivityLedger,
  GridCardEmptyState,
  GridCardPostLedger,
} from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/Pagination";
import type { ActivityFilterType } from "@/utilities/activity-type";
import {
  ACTIVITY_FILTER_ARCHIVE_LABELS,
  ACTIVITY_FILTER_TYPES,
  isActivityFilterType,
} from "@/utilities/activity-type";
import {
  ACTIVITIES_PER_PAGE,
  getPaginatedStaticParams,
  LYOVSON_ITEMS_PER_PAGE,
  MAX_INDEXED_PAGE,
  POSTS_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensure-static-params";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/utilities/generate-json-ld";
import {
  getActivitiesByType,
  getActivityTypeCounts,
  getLyovsonActivitiesByType,
  getLyovsonActivityTypeCounts,
} from "@/utilities/get-activity";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import { getPostsByType, getPostTypeCounts } from "@/utilities/get-post";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import type { PostFilterType } from "@/utilities/post-type";
import {
  isPostFilterType,
  POST_FILTER_TYPES,
  POST_TYPE_LABELS,
} from "@/utilities/post-type";
import {
  absoluteUrl,
  activitiesRoute,
  activitiesTypePageRoute,
  activitiesTypeRoute,
  activityUrl,
  homeRoute,
  lyovsonActivitiesRoute,
  lyovsonActivitiesTypePageRoute,
  lyovsonActivitiesTypeRoute,
  lyovsonRoute,
  PRIMARY_LYOVSONS,
  postsRoute,
  postsTypePageRoute,
  postsTypeRoute,
  postUrl,
} from "@/utilities/routes";
import {
  buildNotFoundMetadata,
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

interface FilteredArchiveShellProps {
  archive: ReactNode;
  breadcrumbs: { name: string; url?: string }[];
  canonicalPath: string;
  description: string;
  getPageHref: (pageNumber: number) => string;
  heading: string;
  itemCount: number;
  items: { url: string }[];
  ledger: ReactNode;
  page?: number | null;
  totalPages: number;
}

function FilteredArchiveShell({
  archive,
  breadcrumbs,
  canonicalPath,
  description,
  getPageHref,
  heading,
  itemCount,
  items,
  ledger,
  page,
  totalPages,
}: FilteredArchiveShellProps) {
  const collectionPageSchema = generateCollectionPageSchema({
    name: heading,
    description,
    url: absoluteUrl(canonicalPath),
    itemCount,
    items,
  });
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <h1 className="sr-only">{heading}</h1>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      {ledger}
      {archive}
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={getPageHref}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

function parseValidatedPage(
  rawPageNumber: string | undefined,
  firstPageRoute: string
): number {
  if (rawPageNumber === undefined) {
    return 1;
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (pageNumber === null) {
    return notFound();
  }
  if (pageNumber === 1) {
    redirect(firstPageRoute);
  }
  return pageNumber;
}

function toActivitySchemaItems(
  docs: Parameters<typeof activityUrl>[0][]
): { url: string }[] {
  return docs
    .map((activity) => {
      const url = activityUrl(activity);
      return url ? { url } : null;
    })
    .filter((item): item is { url: string } => item !== null);
}

function buildPaginatedArchiveMetadata({
  canonicalPath,
  description,
  nextPath,
  pageNumber,
  prevPath,
  title,
}: {
  canonicalPath: string;
  description: string;
  nextPath?: string;
  pageNumber: number;
  prevPath: string;
  title: string;
}): Metadata {
  return buildSeoMetadata({
    title,
    description,
    canonicalPath,
    prevPath,
    nextPath,
    robots:
      pageNumber > MAX_INDEXED_PAGE
        ? { index: false, follow: true }
        : undefined,
  });
}

/* ── Global Activities by Type ─────────────────────────────────────────────── */

export async function renderActivityTypeArchive({
  rawPageNumber,
  type,
}: {
  rawPageNumber?: string;
  type: string;
}) {
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const pageNumber = parseValidatedPage(
    rawPageNumber,
    activitiesTypeRoute(type)
  );
  const [response, counts] = await Promise.all([
    getActivitiesByType(type, pageNumber, ACTIVITIES_PER_PAGE),
    getActivityTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  if (pageNumber > 1 && (docs.length === 0 || pageNumber > totalPages)) {
    return notFound();
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  const isPaginated = pageNumber > 1;
  const heading = isPaginated
    ? `${label} Activities — Page ${pageNumber}`
    : `${label} Activities`;
  const description = isPaginated
    ? `${label} activities logged by the Lyóvson family — Page ${pageNumber}.`
    : `${label} logged by the Lyóvson family.`;
  const canonicalPath = isPaginated
    ? activitiesTypePageRoute(type, pageNumber)
    : activitiesTypeRoute(type);
  const breadcrumbs = isPaginated
    ? [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: "Activities", url: absoluteUrl(activitiesRoute()) },
        { name: label, url: absoluteUrl(activitiesTypeRoute(type)) },
        { name: `Page ${pageNumber}` },
      ]
    : [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: "Activities", url: absoluteUrl(activitiesRoute()) },
        { name: label },
      ];

  return (
    <FilteredArchiveShell
      archive={
        docs.length > 0 ? (
          <ActivitiesArchive activities={docs} />
        ) : (
          <GridCardEmptyState
            description={`No ${label.toLowerCase()} activities have been logged yet.`}
            title={`No ${label} Yet`}
          />
        )
      }
      breadcrumbs={breadcrumbs}
      canonicalPath={canonicalPath}
      description={description}
      getPageHref={(nextPage) => activitiesTypePageRoute(type, nextPage)}
      heading={heading}
      itemCount={totalDocs}
      items={toActivitySchemaItems(docs)}
      ledger={<GridCardActivityLedger activeType={type} counts={counts} />}
      page={page}
      totalPages={totalPages}
    />
  );
}

export async function getActivityTypeMetadata({
  rawPageNumber,
  type,
}: {
  rawPageNumber?: string;
  type: string;
}): Promise<Metadata> {
  if (rawPageNumber === undefined) {
    if (!isActivityFilterType(type)) {
      return buildNotFoundMetadata({
        title: "Activity Type Not Found",
        description: "The requested activity category could not be found.",
      });
    }
    const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
    return buildSeoMetadata({
      title: `${label} Activities`,
      description: `Browse ${label.toLowerCase()} activities logged by the Lyóvson family.`,
      canonicalPath: activitiesTypeRoute(type),
    });
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (!(isActivityFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested activity page could not be found.",
    });
  }

  const response = await getActivitiesByType(
    type,
    pageNumber,
    ACTIVITIES_PER_PAGE
  );
  if (response.docs.length === 0 || pageNumber > response.totalPages) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested activity page could not be found.",
    });
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildPaginatedArchiveMetadata({
    title: `${label} Activities - Page ${pageNumber}`,
    description: `Browse ${label.toLowerCase()} activities logged by the Lyóvson family - Page ${pageNumber}.`,
    canonicalPath: activitiesTypePageRoute(type, pageNumber),
    prevPath: activitiesTypePageRoute(type, pageNumber - 1),
    nextPath:
      pageNumber < response.totalPages
        ? activitiesTypePageRoute(type, pageNumber + 1)
        : undefined,
    pageNumber,
  });
}

export async function getActivityTypePaginatedStaticParams() {
  "use cache";
  cacheTag("activities");
  cacheLife("static");

  const counts = await getActivityTypeCounts();
  const params = ACTIVITY_FILTER_TYPES.flatMap((type) =>
    getPaginatedStaticParams(counts[type] ?? 0, ACTIVITIES_PER_PAGE).map(
      (pageNumber) => ({ pageNumber, type })
    )
  );

  return ensureStaticParams(params, {
    pageNumber: "__placeholder__",
    type: "read" satisfies ActivityFilterType,
  });
}

/* ── Global Posts by Type ──────────────────────────────────────────────────── */

export async function renderPostTypeArchive({
  rawPageNumber,
  type,
}: {
  rawPageNumber?: string;
  type: string;
}) {
  if (!isPostFilterType(type)) {
    return notFound();
  }

  const pageNumber = parseValidatedPage(rawPageNumber, postsTypeRoute(type));
  const [response, counts] = await Promise.all([
    getPostsByType(type, pageNumber, POSTS_PER_PAGE),
    getPostTypeCounts(),
  ]);

  const { docs, page, totalDocs, totalPages } = response;
  if (pageNumber > 1 && (docs.length === 0 || pageNumber > totalPages)) {
    return notFound();
  }

  const label = POST_TYPE_LABELS[type];
  const isPaginated = pageNumber > 1;
  const heading = isPaginated ? `${label} — Page ${pageNumber}` : label;
  const description = isPaginated
    ? `${label} published by Rafa and Jess Lyóvson — Page ${pageNumber}.`
    : `${label} published by Rafa and Jess Lyóvson.`;
  const canonicalPath = isPaginated
    ? postsTypePageRoute(type, pageNumber)
    : postsTypeRoute(type);
  const breadcrumbs = isPaginated
    ? [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: "Posts", url: absoluteUrl(postsRoute()) },
        { name: label, url: absoluteUrl(postsTypeRoute(type)) },
        { name: `Page ${pageNumber}` },
      ]
    : [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: "Posts", url: absoluteUrl(postsRoute()) },
        { name: label },
      ];

  return (
    <FilteredArchiveShell
      archive={
        docs.length > 0 ? (
          <CollectionArchive posts={docs} />
        ) : (
          <GridCardEmptyState
            description={`No ${label.toLowerCase()} have been published yet.`}
            title={`No ${label} Yet`}
          />
        )
      }
      breadcrumbs={breadcrumbs}
      canonicalPath={canonicalPath}
      description={description}
      getPageHref={(nextPage) => postsTypePageRoute(type, nextPage)}
      heading={heading}
      itemCount={totalDocs}
      items={docs
        .filter((post) => post.slug)
        .map((post) => ({ url: postUrl(post.slug as string) }))}
      ledger={<GridCardPostLedger activeType={type} counts={counts} />}
      page={page}
      totalPages={totalPages}
    />
  );
}

export async function getPostTypeMetadata({
  rawPageNumber,
  type,
}: {
  rawPageNumber?: string;
  type: string;
}): Promise<Metadata> {
  if (rawPageNumber === undefined) {
    if (!isPostFilterType(type)) {
      return buildNotFoundMetadata({
        title: "Post Format Not Found",
        description: "The requested post category could not be found.",
      });
    }
    const label = POST_TYPE_LABELS[type];
    return buildSeoMetadata({
      title: label,
      description: `Browse ${label.toLowerCase()} published by Rafa and Jess Lyóvson.`,
      canonicalPath: postsTypeRoute(type),
      image: {
        url: buildDynamicOgImageUrl({
          eyebrow: "Posts",
          title: label,
          meta: "Rafa & Jess Lyóvson",
        }),
        width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
        height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
        alt: label,
      },
    });
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (!(isPostFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested posts page could not be found.",
    });
  }

  const response = await getPostsByType(type, pageNumber, POSTS_PER_PAGE);
  if (response.docs.length === 0 || pageNumber > response.totalPages) {
    return buildNotFoundMetadata({
      title: "Page Not Found",
      description: "The requested posts page could not be found.",
    });
  }

  const label = POST_TYPE_LABELS[type];
  return buildPaginatedArchiveMetadata({
    title: `${label} - Page ${pageNumber}`,
    description: `Browse ${label.toLowerCase()} published by Rafa and Jess Lyóvson - Page ${pageNumber}.`,
    canonicalPath: postsTypePageRoute(type, pageNumber),
    prevPath: postsTypePageRoute(type, pageNumber - 1),
    nextPath:
      pageNumber < response.totalPages
        ? postsTypePageRoute(type, pageNumber + 1)
        : undefined,
    pageNumber,
  });
}

export async function getPostTypePaginatedStaticParams() {
  "use cache";
  cacheTag("posts");
  cacheLife("static");

  const counts = await getPostTypeCounts();
  const params = POST_FILTER_TYPES.flatMap((type) =>
    getPaginatedStaticParams(counts[type] ?? 0, POSTS_PER_PAGE).map(
      (pageNumber) => ({ pageNumber, type })
    )
  );

  return ensureStaticParams(params, {
    pageNumber: "__placeholder__",
    type: "article" satisfies PostFilterType,
  });
}

/* ── Person-Scoped Activities by Type ──────────────────────────────────────── */

export async function renderLyovsonActivityTypeArchive({
  rawPageNumber,
  type,
  username,
}: {
  rawPageNumber?: string;
  type: string;
  username: string;
}) {
  if (!isActivityFilterType(type)) {
    return notFound();
  }

  const pageNumber = parseValidatedPage(
    rawPageNumber,
    lyovsonActivitiesTypeRoute(username, type)
  );
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
  if (pageNumber > 1 && (docs.length === 0 || pageNumber > totalPages)) {
    return notFound();
  }

  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  const isPaginated = pageNumber > 1;
  const heading = isPaginated
    ? `${user.name} — ${label} — Page ${pageNumber}`
    : `${user.name} — ${label}`;
  const description = isPaginated
    ? `${label} activities logged by ${user.name} — Page ${pageNumber}.`
    : `${label} activities logged by ${user.name}.`;
  const canonicalPath = isPaginated
    ? lyovsonActivitiesTypePageRoute(username, type, pageNumber)
    : lyovsonActivitiesTypeRoute(username, type);
  const breadcrumbs = isPaginated
    ? [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: user.name, url: absoluteUrl(lyovsonRoute(username)) },
        {
          name: "Activities",
          url: absoluteUrl(lyovsonActivitiesRoute(username)),
        },
        {
          name: label,
          url: absoluteUrl(lyovsonActivitiesTypeRoute(username, type)),
        },
        { name: `Page ${pageNumber}` },
      ]
    : [
        { name: "Home", url: absoluteUrl(homeRoute()) },
        { name: user.name, url: absoluteUrl(lyovsonRoute(username)) },
        {
          name: "Activities",
          url: absoluteUrl(lyovsonActivitiesRoute(username)),
        },
        { name: label },
      ];

  return (
    <FilteredArchiveShell
      archive={
        docs.length > 0 ? (
          <ActivitiesArchive activities={docs} />
        ) : (
          <GridCardEmptyState
            description={`No ${label.toLowerCase()} activities logged for ${user.name} yet.`}
            title={`No ${label} Yet`}
          />
        )
      }
      breadcrumbs={breadcrumbs}
      canonicalPath={canonicalPath}
      description={description}
      getPageHref={(nextPage) =>
        lyovsonActivitiesTypePageRoute(username, type, nextPage)
      }
      heading={heading}
      itemCount={totalDocs}
      items={toActivitySchemaItems(docs)}
      ledger={
        <GridCardActivityLedger
          activeType={type}
          baseHref={lyovsonActivitiesRoute(username)}
          counts={counts}
          getTypeHref={(nextType) =>
            lyovsonActivitiesTypeRoute(username, nextType)
          }
        />
      }
      page={page}
      totalPages={totalPages}
    />
  );
}

export async function getLyovsonActivityTypeMetadata({
  buildMetadata,
  buildNotFound,
  rawPageNumber,
  type,
  username,
}: {
  buildMetadata: (args: {
    canonicalPath: string;
    description: string;
    nextPath?: string;
    prevPath?: string;
    robots?: Metadata["robots"];
    title: string;
  }) => Metadata;
  buildNotFound: () => Metadata;
  rawPageNumber?: string;
  type: string;
  username: string;
}): Promise<Metadata> {
  if (rawPageNumber === undefined) {
    if (!isActivityFilterType(type)) {
      return buildNotFound();
    }
    const user = await getLyovsonProfile(username);
    if (!user) {
      return buildNotFound();
    }
    const name = user.name || username;
    const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
    return buildMetadata({
      title: `${name} ${label}`,
      description: `Browse ${label.toLowerCase()} activities logged by ${name}.`,
      canonicalPath: lyovsonActivitiesTypeRoute(username, type),
    });
  }

  const pageNumber = parsePageNumber(rawPageNumber);
  if (!(isActivityFilterType(type) && pageNumber !== null && pageNumber > 1)) {
    return buildNotFound();
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
    return buildNotFound();
  }

  const name = user.name || username;
  const label = ACTIVITY_FILTER_ARCHIVE_LABELS[type];
  return buildMetadata({
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

export async function getLyovsonActivityTypePaginatedStaticParams() {
  "use cache";
  cacheTag("activities");
  cacheTag("lyovsons");
  cacheLife("static");

  const results = await Promise.all(
    PRIMARY_LYOVSONS.map(async (lyovson) => ({
      counts: await getLyovsonActivityTypeCounts(lyovson),
      lyovson,
    }))
  );

  const params = results.flatMap(({ counts, lyovson }) => {
    if (!counts) {
      return [];
    }
    return ACTIVITY_FILTER_TYPES.flatMap((type) =>
      getPaginatedStaticParams(counts[type] ?? 0, LYOVSON_ITEMS_PER_PAGE).map(
        (pageNumber) => ({ lyovson, pageNumber, type })
      )
    );
  });

  return ensureStaticParams(params, {
    lyovson: PRIMARY_LYOVSONS[0],
    pageNumber: "__placeholder__",
    type: "read" satisfies ActivityFilterType,
  });
}
