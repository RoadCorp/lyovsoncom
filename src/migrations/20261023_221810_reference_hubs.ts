import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_activities_format" AS ENUM('print', 'ebook', 'audiobook', 'fullCast');
  CREATE TYPE "public"."enum__activities_v_version_format" AS ENUM('print', 'ebook', 'audiobook', 'fullCast');
  ALTER TYPE "public"."enum_references_type" ADD VALUE 'software' BEFORE 'other';
  ALTER TYPE "public"."enum__references_v_version_type" ADD VALUE 'software' BEFORE 'other';
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "_media_v" ADD COLUMN "version_credit" varchar;
  ALTER TABLE "activities" ADD COLUMN "format" "enum_activities_format";
  ALTER TABLE "_activities_v" ADD COLUMN "version_format" "enum__activities_v_version_format";
  -- Format moves from the work to the copy each activity used.
  UPDATE "activities" a SET "format" = (CASE r."format"
      WHEN 'hardcover' THEN 'print' WHEN 'paperback' THEN 'print'
      ELSE r."format"::text END)::"enum_activities_format"
    FROM "references" r
    WHERE a."reference_id" = r."id" AND r."format" IS NOT NULL;
  UPDATE "_activities_v" v SET "version_format" = a."format"::text::"enum__activities_v_version_format"
    FROM "activities" a
    WHERE v."parent_id" = a."id" AND v."latest" AND a."format" IS NOT NULL;
  ALTER TABLE "references" DROP COLUMN "format";
  ALTER TABLE "_references_v" DROP COLUMN "version_format";
  DROP TYPE "public"."enum_references_format";
  DROP TYPE "public"."enum__references_v_version_format";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_references_format" AS ENUM('hardcover', 'paperback', 'ebook', 'audiobook');
  CREATE TYPE "public"."enum__references_v_version_format" AS ENUM('hardcover', 'paperback', 'ebook', 'audiobook');
  -- Software has no older equivalent; activity formats are not moved back.
  UPDATE "references" SET "type" = 'other' WHERE "type" = 'software';
  UPDATE "_references_v" SET "version_type" = 'other' WHERE "version_type" = 'software';
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_references_type";
  CREATE TYPE "public"."enum_references_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'organization', 'course', 'other');
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE "public"."enum_references_type" USING "type"::"public"."enum_references_type";
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__references_v_version_type";
  CREATE TYPE "public"."enum__references_v_version_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'organization', 'course', 'other');
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__references_v_version_type" USING "version_type"::"public"."enum__references_v_version_type";
  ALTER TABLE "references" ADD COLUMN "format" "enum_references_format";
  ALTER TABLE "_references_v" ADD COLUMN "version_format" "enum__references_v_version_format";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "_media_v" DROP COLUMN "version_credit";
  ALTER TABLE "activities" DROP COLUMN "format";
  ALTER TABLE "_activities_v" DROP COLUMN "version_format";
  DROP TYPE "public"."enum_activities_format";
  DROP TYPE "public"."enum__activities_v_version_format";`);
}
