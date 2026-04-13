import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { JsonLd } from "@/components/JsonLd";
import { NotesArchive } from "@/components/NotesArchive";
import { Pagination } from "@/components/Pagination";
import { NOTES_PER_PAGE } from "@/utilities/archive";
import { generateCollectionPageSchema } from "@/utilities/generate-json-ld";
import { getLatestNotes } from "@/utilities/get-note";
import { getServerSideURL } from "@/utilities/getURL";
import {
  absoluteUrl,
  notesPageRoute,
  notesRoute,
  noteUrl,
} from "@/utilities/routes";

export default async function Page() {
  "use cache";

  cacheTag("notes");
  cacheTag("notes-page");
  cacheLife("notes");

  const response = await getLatestNotes(NOTES_PER_PAGE);

  if (!response) {
    return notFound();
  }

  const { docs, page, totalDocs, totalPages } = response;

  const collectionPageSchema = generateCollectionPageSchema({
    name: "Notes & Thoughts",
    description:
      "Browse quotes, thoughts, and reflections on books, movies, ideas, and life.",
    url: absoluteUrl(notesRoute()),
    itemCount: totalDocs,
    items: docs
      .filter((note) => note.slug)
      .map((note) => ({ url: noteUrl(note.slug as string) })),
  });

  return (
    <>
      <h1 className="sr-only">All Notes & Thoughts</h1>
      <JsonLd data={collectionPageSchema} />
      <NotesArchive notes={docs} />
      {totalPages > 1 && page ? (
        <Pagination
          getPageHref={(pageNumber) => notesPageRoute(pageNumber)}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "All Notes & Thoughts | Lyóvson.com",
  description:
    "Browse quotes, thoughts, and reflections on books, movies, ideas, and life.",
  alternates: {
    canonical: notesRoute(),
  },
  openGraph: {
    title: "All Notes & Thoughts | Lyóvson.com",
    description:
      "Browse quotes, thoughts, and reflections on books, movies, ideas, and life.",
    url: notesRoute(),
    siteName: "Lyóvson.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Notes & Thoughts | Lyóvson.com",
    description:
      "Browse quotes, thoughts, and reflections on books, movies, ideas, and life.",
  },
};
