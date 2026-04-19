import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { CollectionArchive } from "@/components/CollectionArchive";
import {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Pagination } from "@/components/Pagination";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  POSTS_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestActivities } from "@/utilities/get-activity";
import { getPaginatedPosts, getPostCount } from "@/utilities/get-post";
import { getServerSideURL } from "@/utilities/getURL";
import {
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import {
  absoluteUrl,
  homepageRoute,
  homeRoute,
  postUrl,
} from "@/utilities/routes";

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";

  cacheTag("homepage");
  cacheTag("posts");
  cacheLife("static");

  const { totalDocs } = await getPostCount();

  return ensureStaticParams(
    getPaginatedStaticParams(totalDocs, POSTS_PER_PAGE).map((pageNumber) => ({
      pageNumber,
    })),
    { pageNumber: "__placeholder__" }
  );
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise;
  const pageState = getPaginatedArchivePageState(pageNumber);

  if (pageState.kind === "notFound") {
    notFound();
  }

  if (pageState.kind === "redirect") {
    redirect(homeRoute());
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const [postResponse, activityResponse] = await Promise.all([
    getPaginatedPosts(sanitizedPageNumber, POSTS_PER_PAGE),
    getLatestActivities(ACTIVITY_PREVIEW_LIMIT),
  ]);
  const { docs, totalDocs, totalPages } = postResponse;
  const hasActivitiesPreview = activityResponse.docs.length > 0;

  if (isPaginatedArchivePageOutOfRange(sanitizedPageNumber, totalPages)) {
    notFound();
  }

  const collectionPageSchema = generateCollectionPageSchema({
    name: `Latest Posts - Page ${sanitizedPageNumber}`,
    description: `Latest posts archive page ${sanitizedPageNumber}.`,
    url: absoluteUrl(homepageRoute(sanitizedPageNumber)),
    itemCount: totalDocs,
    items: docs
      .filter((post) => post.slug)
      .map((post) => ({ url: postUrl(post.slug as string) })),
  });

  return (
    <>
      <h1 className="sr-only">
        Lyóvson.com - Latest Posts - Page {sanitizedPageNumber}
      </h1>
      <JsonLd data={collectionPageSchema} />
      <CollectionArchive posts={docs} />
      <GridCardActivitiesPreview
        activities={activityResponse.docs}
        className={HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME}
      />
      <Pagination
        className={
          hasActivitiesPreview
            ? ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME
            : undefined
        }
        getPageHref={(pageNumberValue) => homepageRoute(pageNumberValue)}
        page={sanitizedPageNumber}
        totalPages={totalPages}
      />
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  const title = `Latest Posts - Page ${sanitizedPageNumber} | Lyóvson.com`;
  const description = `Latest posts archive page ${sanitizedPageNumber} from Lyovson.com.`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    keywords: [
      "latest posts",
      "articles",
      "Rafa Lyóvson",
      "Jess Lyóvson",
      "programming",
      "writing",
      "design",
      "philosophy",
      "research",
      "projects",
      "technology",
      "blog",
    ],
    alternates: {
      canonical: homepageRoute(sanitizedPageNumber),
    },
    openGraph: {
      siteName: "Lyóvson.com",
      title,
      description,
      type: "website",
      url: homepageRoute(sanitizedPageNumber),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Latest Posts | Lyóvson.com",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@lyovson",
      site: "@lyovson",
      images: [
        {
          url: "/og-image.png",
          alt: "Latest Posts | Lyóvson.com",
          width: 1200,
          height: 630,
        },
      ],
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
