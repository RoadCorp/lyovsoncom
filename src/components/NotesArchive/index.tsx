import type React from "react";
import { ArchiveItems } from "@/components/ArchiveItems";
import type { Note } from "@/payload-types";

export interface Props {
  notes: Note[];
}

export const NotesArchive: React.FC<Props> = (props) => {
  const { notes } = props;

  return (
    <ArchiveItems
      items={notes.flatMap((note) =>
        typeof note === "object" && note !== null
          ? [{ type: "note" as const, data: note }]
          : []
      )}
    />
  );
};
