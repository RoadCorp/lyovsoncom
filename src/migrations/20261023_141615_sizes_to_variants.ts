import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Copies rather than renames (Payload's sizes-to-variants helper renames):
// the previous build still reads `sizes_*` while the Payload 4 build deploys.
// `20261023_141618_drop_legacy_columns` drops them once the new build is live.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "variants_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filename" varchar;
  UPDATE "media" SET
    "variants_thumbnail_url" = "sizes_thumbnail_url",
    "variants_thumbnail_width" = "sizes_thumbnail_width",
    "variants_thumbnail_height" = "sizes_thumbnail_height",
    "variants_thumbnail_mime_type" = "sizes_thumbnail_mime_type",
    "variants_thumbnail_filesize" = "sizes_thumbnail_filesize",
    "variants_thumbnail_filename" = "sizes_thumbnail_filename";
  CREATE INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx" ON "media" USING btree ("variants_thumbnail_filename");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filename";`);
}
