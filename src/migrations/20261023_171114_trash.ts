import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_projects_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "activities" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_activities_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "notes" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_notes_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  CREATE INDEX "posts_deleted_at_idx" ON "posts" USING btree ("deleted_at");
  CREATE INDEX "_posts_v_version_version_deleted_at_idx" ON "_posts_v" USING btree ("version_deleted_at");
  CREATE INDEX "projects_deleted_at_idx" ON "projects" USING btree ("deleted_at");
  CREATE INDEX "_projects_v_version_version_deleted_at_idx" ON "_projects_v" USING btree ("version_deleted_at");
  CREATE INDEX "activities_deleted_at_idx" ON "activities" USING btree ("deleted_at");
  CREATE INDEX "_activities_v_version_version_deleted_at_idx" ON "_activities_v" USING btree ("version_deleted_at");
  CREATE INDEX "notes_deleted_at_idx" ON "notes" USING btree ("deleted_at");
  CREATE INDEX "_notes_v_version_version_deleted_at_idx" ON "_notes_v" USING btree ("version_deleted_at");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "posts_deleted_at_idx";
  DROP INDEX "_posts_v_version_version_deleted_at_idx";
  DROP INDEX "projects_deleted_at_idx";
  DROP INDEX "_projects_v_version_version_deleted_at_idx";
  DROP INDEX "activities_deleted_at_idx";
  DROP INDEX "_activities_v_version_version_deleted_at_idx";
  DROP INDEX "notes_deleted_at_idx";
  DROP INDEX "_notes_v_version_version_deleted_at_idx";
  ALTER TABLE "posts" DROP COLUMN "deleted_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "projects" DROP COLUMN "deleted_at";
  ALTER TABLE "_projects_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "activities" DROP COLUMN "deleted_at";
  ALTER TABLE "_activities_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "notes" DROP COLUMN "deleted_at";
  ALTER TABLE "_notes_v" DROP COLUMN "version_deleted_at";`);
}
