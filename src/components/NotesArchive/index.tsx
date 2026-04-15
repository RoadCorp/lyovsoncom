import type React from "react";
import { ArchiveItems, toArchiveItems } from "@/components/ArchiveItems";
import type { Note } from "@/payload-types";

export interface Props {
  notes: Note[];
}

export const NotesArchive: React.FC<Props> = (props) => {
  const { notes } = props;

  return <ArchiveItems items={toArchiveItems(notes, "note")} />;
};
