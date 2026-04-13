import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { JsonLd } from "@/components/JsonLd";
import { NotesArchive } from "@/components/NotesArchive";
import { Pagination } from "@/components/Pagination";
import {
  getPaginatedStaticParams,
  MAX_INDEXED_PAGE,
  NOTES_PER_PAGE,
  parsePageNumber,
} from "@/utilities/archive";
import { ensureStaticParams } from "@/utilities/ensureStaticParams";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getNoteCount, getPaginatedNotes } from "@/utilities/get-note";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  notesPageRoute,
  notesRoute,
  noteUrl,
} from "@/utilities/routes";

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
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null) {
    notFound();
  }

  if (sanitizedPageNumber === 1) {
    redirect(notesRoute());
  }

  const response = await getPaginatedNotes(sanitizedPageNumber, NOTES_PER_PAGE);

  if (!response) {
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
  const sanitizedPageNumber = parsePageNumber(pageNumber);

  if (sanitizedPageNumber == null || sanitizedPageNumber < 2) {
    return {
      title: "Not Found | Lyovson.com",
      description: "The requested page could not be found",
    };
  }

  const title = `Notes & Thoughts - Page ${sanitizedPageNumber} | Lyóvson.com`;
  const description = `Browse quotes, thoughts, and reflections - Page ${sanitizedPageNumber}`;

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    alternates: {
      canonical: notesPageRoute(sanitizedPageNumber),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: notesPageRoute(sanitizedPageNumber),
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@lyovson",
    },
    robots: {
      index: sanitizedPageNumber <= MAX_INDEXED_PAGE,
      follow: true,
      noarchive: sanitizedPageNumber > 1,
    },
  };
}
