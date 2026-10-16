import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_highlights_live" AS ENUM('lyovson-posts', 'lyovson-activities', 'avenews-publications', 'concernedeu-releases');
  CREATE TYPE "public"."enum__projects_v_version_highlights_live" AS ENUM('lyovson-posts', 'lyovson-activities', 'avenews-publications', 'concernedeu-releases');
  ALTER TABLE "projects_highlights" ADD COLUMN "live" "enum_projects_highlights_live";
  ALTER TABLE "_projects_v_version_highlights" ADD COLUMN "live" "enum__projects_v_version_highlights_live";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_highlights" DROP COLUMN "live";
  ALTER TABLE "_projects_v_version_highlights" DROP COLUMN "live";
  DROP TYPE "public"."enum_projects_highlights_live";
  DROP TYPE "public"."enum__projects_v_version_highlights_live";`);
}
