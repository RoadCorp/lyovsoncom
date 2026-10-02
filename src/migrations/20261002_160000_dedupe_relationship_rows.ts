import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Some posts and activities carried each relationship row many times (one
// post had 64 topic rows for 2 topics and 32 author rows). Payload returned
// every copy, so the REST API and Article JSON-LD listed authors and topics
// repeatedly. Keep the first row for each parent, path and target. Version
// tables are cleaned too, so restoring an old version can't bring the
// copies back. Idempotent: a second run deletes nothing.
const TABLES = [
  {
    table: "posts_rels",
    targets: ["lyovsons_id", "topics_id", "notes_id", "references_id"],
  },
  {
    table: "_posts_v_rels",
    targets: ["lyovsons_id", "topics_id", "notes_id", "references_id"],
  },
  {
    table: "notes_rels",
    targets: ["posts_id", "notes_id", "references_id", "topics_id"],
  },
  {
    table: "_notes_v_rels",
    targets: ["posts_id", "notes_id", "references_id", "topics_id"],
  },
  { table: "activities_rels", targets: ["lyovsons_id"] },
  { table: "_activities_v_rels", targets: ["lyovsons_id"] },
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { table, targets } of TABLES) {
    const key = ["parent_id", "path", ...targets]
      .map((column) => `"${column}"`)
      .join(", ");
    await db.execute(
      sql.raw(`
        DELETE FROM "${table}" duplicate
        USING (
          SELECT id, row_number() OVER (PARTITION BY ${key} ORDER BY id) AS copy
          FROM "${table}"
        ) ranked
        WHERE duplicate.id = ranked.id AND ranked.copy > 1;
      `)
    );
  }
}

// Removed rows were exact copies, so there is nothing to restore.
export async function down(_args: MigrateDownArgs): Promise<void> {
  // Intentionally empty.
}
