import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { JsonLd } from "@/components/JsonLd";
import { NotesArchive } from "@/components/NotesArchive";
import { Pagination } from "@/components/Pagination";
import { getPaginatedStaticParams, NOTES_PER_PAGE } from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getNoteCount, getPaginatedNotes } from "@/utilities/get-note";
import {
  buildPaginatedArchiveMetadata,
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "@/utilities/paginated-archive";
import {
  absoluteUrl,
  notesPageRoute,
  notesRoute,
  noteUrl,
} from "@/utilities/routes";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";

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

  return ensureStaticParams(
    getPaginatedStaticParams(totalDocs, NOTES_PER_PAGE).map((pageNumber) => ({
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
    redirect(notesRoute());
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const response = await getPaginatedNotes(sanitizedPageNumber, NOTES_PER_PAGE);

  if (
    !response ||
    isPaginatedArchivePageOutOfRange(sanitizedPageNumber, response.totalPages)
  ) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: `Notes - Page ${sanitizedPageNumber}`,
    description: `Archive of notes and reflections on page ${sanitizedPageNumber}.`,
    url: absoluteUrl(notesPageRoute(sanitizedPageNumber)),
    itemCount: totalDocs,
    items: docs
      .filter((note) => note.slug)
      .map((note) => ({ url: noteUrl(note.slug as string) })),
  });

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <NotesArchive notes={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumberValue) => notesPageRoute(pageNumberValue)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise;
  const pageState = getPaginatedArchivePageState(pageNumber);

  if (pageState.kind !== "page") {
    return buildNotFoundMetadata();
  }

  const sanitizedPageNumber = pageState.pageNumber;
  const title = `Notes & Thoughts - Page ${sanitizedPageNumber}`;
  const description = `Browse quotes, thoughts, and reflections - Page ${sanitizedPageNumber}`;

  return buildPaginatedArchiveMetadata({
    canonicalPath: notesPageRoute(sanitizedPageNumber),
    description,
    pageNumber: sanitizedPageNumber,
    title,
  });
}
