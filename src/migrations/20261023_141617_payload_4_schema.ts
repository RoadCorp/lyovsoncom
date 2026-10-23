import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // The native slug field indexes slugs as unique. Books and their films
  // share titles, so later duplicates take their type as a suffix; reference
  // slugs appear in no public URL.
  await db.execute(sql`
   UPDATE "references" AS r
   SET "slug" = r."slug" || '-' || coalesce(r."type"::text, r."id"::text)
   FROM (
     SELECT "id", row_number() OVER (PARTITION BY "slug" ORDER BY "id") AS rn
     FROM "references"
     WHERE "slug" IS NOT NULL
   ) AS d
   WHERE r."id" = d."id" AND d.rn > 1;`);
  // Same title and same type: the id breaks the tie.
  await db.execute(sql`
   UPDATE "references" AS r
   SET "slug" = r."slug" || '-' || r."id"::text
   FROM (
     SELECT "id", row_number() OVER (PARTITION BY "slug" ORDER BY "id") AS rn
     FROM "references"
     WHERE "slug" IS NOT NULL
   ) AS d
   WHERE r."id" = d."id" AND d.rn > 1;`);
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar,
  	"version_caption" jsonb,
  	"version_prefix" varchar DEFAULT '',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"version_variants_thumbnail_url" varchar,
  	"version_variants_thumbnail_width" numeric,
  	"version_variants_thumbnail_height" numeric,
  	"version_variants_thumbnail_mime_type" varchar,
  	"version_variants_thumbnail_filesize" numeric,
  	"version_variants_thumbnail_filename" varchar,
  	"version_variants_thumbnail_prefix" varchar,
  	"version_variants_thumbnail__objectkey" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_topics_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_description" varchar,
  	"version_color" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar NOT NULL,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "lyovsons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "references_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_references_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  DROP INDEX "posts_slug_idx";
  DROP INDEX "topics_slug_idx";
  DROP INDEX "projects_slug_idx";
  DROP INDEX "references_slug_idx";
  DROP INDEX "notes_slug_idx";
  ALTER TABLE "topics" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "media" ADD COLUMN "original_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "original_url" varchar;
  ALTER TABLE "media" ADD COLUMN "original_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "original_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "original_width" numeric;
  ALTER TABLE "media" ADD COLUMN "original_height" numeric;
  ALTER TABLE "media" ADD COLUMN "original_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "original__objectkey" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_prefix" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail__objectkey" varchar;
  ALTER TABLE "notes_rels" ADD COLUMN "lyovsons_id" integer;
  ALTER TABLE "_notes_v_rels" ADD COLUMN "lyovsons_id" integer;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_breadcrumbs" ADD CONSTRAINT "_topics_v_version_breadcrumbs_doc_id_topics_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_breadcrumbs" ADD CONSTRAINT "_topics_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_version_parent_id_topics_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons_rels" ADD CONSTRAINT "lyovsons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons_rels" ADD CONSTRAINT "lyovsons_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_rels" ADD CONSTRAINT "references_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_rels" ADD CONSTRAINT "references_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_rels" ADD CONSTRAINT "_references_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_rels" ADD CONSTRAINT "_references_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_lyovsons_id_idx" ON "media_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_version_variants_thumbnail_version_variants_thu_idx" ON "_media_v" USING btree ("version_variants_thumbnail_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_lyovsons_id_idx" ON "_media_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "topics_rels_order_idx" ON "topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_lyovsons_id_idx" ON "topics_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_topics_v_version_breadcrumbs_order_idx" ON "_topics_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_topics_v_version_breadcrumbs_parent_id_idx" ON "_topics_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_breadcrumbs_doc_idx" ON "_topics_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_topics_v_parent_idx" ON "_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_seo_version_seo_image_idx" ON "_topics_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_topics_v_version_version_slug_idx" ON "_topics_v" USING btree ("version_slug");
  CREATE INDEX "_topics_v_version_version_parent_idx" ON "_topics_v" USING btree ("version_parent_id");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_created_at_idx" ON "_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_rels_order_idx" ON "_topics_v_rels" USING btree ("order");
  CREATE INDEX "_topics_v_rels_parent_idx" ON "_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_topics_v_rels_path_idx" ON "_topics_v_rels" USING btree ("path");
  CREATE INDEX "_topics_v_rels_lyovsons_id_idx" ON "_topics_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "lyovsons_rels_order_idx" ON "lyovsons_rels" USING btree ("order");
  CREATE INDEX "lyovsons_rels_parent_idx" ON "lyovsons_rels" USING btree ("parent_id");
  CREATE INDEX "lyovsons_rels_path_idx" ON "lyovsons_rels" USING btree ("path");
  CREATE INDEX "lyovsons_rels_lyovsons_id_idx" ON "lyovsons_rels" USING btree ("lyovsons_id");
  CREATE INDEX "references_rels_order_idx" ON "references_rels" USING btree ("order");
  CREATE INDEX "references_rels_parent_idx" ON "references_rels" USING btree ("parent_id");
  CREATE INDEX "references_rels_path_idx" ON "references_rels" USING btree ("path");
  CREATE INDEX "references_rels_lyovsons_id_idx" ON "references_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_references_v_rels_order_idx" ON "_references_v_rels" USING btree ("order");
  CREATE INDEX "_references_v_rels_parent_idx" ON "_references_v_rels" USING btree ("parent_id");
  CREATE INDEX "_references_v_rels_path_idx" ON "_references_v_rels" USING btree ("path");
  CREATE INDEX "_references_v_rels_lyovsons_id_idx" ON "_references_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_lyovsons_id_idx" ON "payload_llm_instructions_rels" USING btree ("lyovsons_id");
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "notes_rels_lyovsons_id_idx" ON "notes_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_notes_v_rels_lyovsons_id_idx" ON "_notes_v_rels" USING btree ("lyovsons_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE UNIQUE INDEX "references_slug_idx" ON "references" USING btree ("slug");
  CREATE UNIQUE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_media_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_topics_v_version_breadcrumbs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_topics_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_topics_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lyovsons_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_llm_instructions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_llm_instructions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "topics_rels" CASCADE;
  DROP TABLE "_topics_v_version_breadcrumbs" CASCADE;
  DROP TABLE "_topics_v" CASCADE;
  DROP TABLE "_topics_v_rels" CASCADE;
  DROP TABLE "lyovsons_rels" CASCADE;
  DROP TABLE "references_rels" CASCADE;
  DROP TABLE "_references_v_rels" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_lyovsons_fk";
  
  ALTER TABLE "_notes_v_rels" DROP CONSTRAINT "_notes_v_rels_lyovsons_fk";
  
  DROP INDEX "media_original_original_filename_idx";
  DROP INDEX "notes_rels_lyovsons_id_idx";
  DROP INDEX "_notes_v_rels_lyovsons_id_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "topics_slug_idx";
  DROP INDEX "projects_slug_idx";
  DROP INDEX "references_slug_idx";
  DROP INDEX "notes_slug_idx";
  ALTER TABLE "topics" ALTER COLUMN "slug" DROP NOT NULL;
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "references_slug_idx" ON "references" USING btree ("slug");
  CREATE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "original_filename";
  ALTER TABLE "media" DROP COLUMN "original_url";
  ALTER TABLE "media" DROP COLUMN "original_mime_type";
  ALTER TABLE "media" DROP COLUMN "original_filesize";
  ALTER TABLE "media" DROP COLUMN "original_width";
  ALTER TABLE "media" DROP COLUMN "original_height";
  ALTER TABLE "media" DROP COLUMN "original_prefix";
  ALTER TABLE "media" DROP COLUMN "original__objectkey";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_prefix";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail__objectkey";
  ALTER TABLE "notes_rels" DROP COLUMN "lyovsons_id";
  ALTER TABLE "_notes_v_rels" DROP COLUMN "lyovsons_id";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`);
}
