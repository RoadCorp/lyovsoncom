import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Runs after the Payload 4 deploy is live: the previous build still reads
// these columns while the new one builds. Thumbnails the previous build
// uploaded meanwhile are copied to the variant columns first.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "media" SET
    "variants_thumbnail_url" = "sizes_thumbnail_url",
    "variants_thumbnail_width" = "sizes_thumbnail_width",
    "variants_thumbnail_height" = "sizes_thumbnail_height",
    "variants_thumbnail_mime_type" = "sizes_thumbnail_mime_type",
    "variants_thumbnail_filesize" = "sizes_thumbnail_filesize",
    "variants_thumbnail_filename" = "sizes_thumbnail_filename"
  WHERE "variants_thumbnail_filename" IS NULL AND "sizes_thumbnail_filename" IS NOT NULL;
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "posts" DROP COLUMN "slug_lock";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slug_lock";
  ALTER TABLE "topics" DROP COLUMN "slug_lock";
  ALTER TABLE "projects" DROP COLUMN "slug_lock";
  ALTER TABLE "_projects_v" DROP COLUMN "version_slug_lock";
  ALTER TABLE "references" DROP COLUMN "slug_lock";
  ALTER TABLE "_references_v" DROP COLUMN "version_slug_lock";
  ALTER TABLE "activities" DROP COLUMN "slug_lock";
  ALTER TABLE "_activities_v" DROP COLUMN "version_slug_lock";
  ALTER TABLE "notes" DROP COLUMN "slug_lock";
  ALTER TABLE "_notes_v" DROP COLUMN "version_slug_lock";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  UPDATE "media" SET
    "sizes_thumbnail_url" = "variants_thumbnail_url",
    "sizes_thumbnail_width" = "variants_thumbnail_width",
    "sizes_thumbnail_height" = "variants_thumbnail_height",
    "sizes_thumbnail_mime_type" = "variants_thumbnail_mime_type",
    "sizes_thumbnail_filesize" = "variants_thumbnail_filesize",
    "sizes_thumbnail_filename" = "variants_thumbnail_filename";
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  ALTER TABLE "posts" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;
  ALTER TABLE "topics" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "projects" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_projects_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;
  ALTER TABLE "references" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_references_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;
  ALTER TABLE "activities" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_activities_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;
  ALTER TABLE "notes" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "_notes_v" ADD COLUMN "version_slug_lock" boolean DEFAULT true;`);
}
