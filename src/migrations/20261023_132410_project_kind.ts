import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Every project so far is a site except the two post series.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_kind" AS ENUM('website', 'series', 'other');
  CREATE TYPE "public"."enum__projects_v_version_kind" AS ENUM('website', 'series', 'other');
  ALTER TABLE "projects" ADD COLUMN "kind" "enum_projects_kind" DEFAULT 'website';
  ALTER TABLE "_projects_v" ADD COLUMN "version_kind" "enum__projects_v_version_kind" DEFAULT 'website';
  UPDATE "projects" SET "kind" = 'series' WHERE "slug" IN ('x-files', 'media-musings');
  UPDATE "_projects_v" SET "version_kind" = 'series' WHERE "parent_id" IN (SELECT "id" FROM "projects" WHERE "kind" = 'series');`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "kind";
  ALTER TABLE "_projects_v" DROP COLUMN "version_kind";
  DROP TYPE "public"."enum_projects_kind";
  DROP TYPE "public"."enum__projects_v_version_kind";`);
}
