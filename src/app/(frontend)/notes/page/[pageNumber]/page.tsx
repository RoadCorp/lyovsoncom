import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { SkeletonGrid } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { NotesArchive } from "@/components/NotesArchive";
import { Pagination } from "@/components/Pagination";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getNoteCount, getPaginatedNotes } from "@/utilities/get-note";
import { getServerSideURL } from "@/utilities/getURL";

const NOTES_PER_PAGE = 25;
const MAX_INDEXED_PAGE = 3;

interface Args {
  params: Promise<{
    pageNumber: string;
  }>;
}

export async function generateStaticParams() {
  "use cache";
  cacheTag("notes");
  cacheLife("static");

  const { totalDocs } = await getNoteCount();
  const totalPages = Math.ceil(totalDocs / NOTES_PER_PAGE);
  const pages: { pageNumber: string }[] = [];

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    pages.push({ pageNumber: String(pageNumber) });
  }

  return ensureStaticParams(pages, { pageNumber: "1" });
}

export default async function Page({ params: paramsPromise }: Args) {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  cacheTag("notes");
  cacheTag(`notes-page-${pageNumber}`);
  cacheLife("notes");

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) {
    notFound();
  }
  if (sanitizedPageNumber === 1) {
    redirect("/notes");
  }

  const response = await getPaginatedNotes(sanitizedPageNumber, NOTES_PER_PAGE);

  if (!response) {
    return notFound();
  }

  const { docs, totalPages, page } = response;
  const collectionPageSchema = generateCollectionPageSchema({
    name: `Notes - Page ${sanitizedPageNumber}`,
    description: `Archive of notes and reflections on page ${sanitizedPageNumber}.`,
    url: `${getServerSideURL()}/notes/page/${sanitizedPageNumber}`,
    itemCount: response.totalDocs,
    items: docs
      .filter((note) => note.slug)
      .map((note) => ({
        url: `${getServerSideURL()}/notes/${note.slug}`,
      })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />

      <Suspense fallback={<SkeletonGrid />}>
        <NotesArchive notes={docs} />
      </Suspense>

      {totalPages > 1 && page && (
        <Pagination
          basePath="/notes/page"
          firstPagePath="/notes"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  "use cache";

  const { pageNumber } = await paramsPromise;
  const sanitizedPageNumber = Number(pageNumber);

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 2) {
    return {
      metadataBase: new URL(getServerSideURL()),
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `Notes & Thoughts - Page ${sanitizedPageNumber} | Lyóvson.com`,
    description: `Browse quotes, thoughts, and reflections - Page ${sanitizedPageNumber}`,
    alternates: {
      canonical: `/notes/page/${sanitizedPageNumber}`,
      ...(sanitizedPageNumber > 1 && {
        prev:
          sanitizedPageNumber === 2
            ? "/notes"
            : `/notes/page/${sanitizedPageNumber - 1}`,
      }),
    },
    openGraph: {
      title: `Notes & Thoughts - Page ${sanitizedPageNumber} | Lyóvson.com`,
      description: `Browse quotes, thoughts, and reflections - Page ${sanitizedPageNumber}`,
      type: "website",
      url: `/notes/page/${sanitizedPageNumber}`,
    },
    twitter: {
      card: "summary",
      title: `Notes & Thoughts - Page ${sanitizedPageNumber} | Lyóvson.com`,
      description: `Browse quotes, thoughts, and reflections - Page ${sanitizedPageNumber}`,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
