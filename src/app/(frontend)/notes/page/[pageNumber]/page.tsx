import { NotesArchive } from "@/components/NotesArchive";
import { NOTES_PER_PAGE } from "@/utilities/archive";
import { createPaginatedArchivePage } from "@/utilities/create-paginated-archive-page";
import { getPaginatedNotes } from "@/utilities/get-note";
import { notesPageRoute, notesRoute, noteUrl } from "@/utilities/routes";

export const prefetch = "partial";

const archive = createPaginatedArchivePage({
  collection: "notes",
  copy: {
    heading: "All Notes",
    metaDescription: (page) =>
      `Browse quotes, thoughts, and reflections - Page ${page}`,
    metaTitle: (page) => `Notes & Thoughts - Page ${page}`,
    schemaDescription: (page) =>
      `Archive of notes and reflections on page ${page}.`,
    schemaName: "Notes",
  },
  getItemUrl: (note) => (note.slug ? noteUrl(note.slug) : null),
  getPage: getPaginatedNotes,
  perPage: NOTES_PER_PAGE,
  renderItems: (notes) => <NotesArchive notes={notes} />,
  routes: { index: notesRoute, page: notesPageRoute },
});

export const generateMetadata = archive.generateMetadata;
export const generateStaticParams = archive.generateStaticParams;
export default archive.Page;
