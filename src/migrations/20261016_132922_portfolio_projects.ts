import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "projects_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "projects_case_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"captured_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_projects_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_case_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"captured_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_url" varchar,
  	"version_repository" varchar,
  	"version_client" varchar,
  	"version_role" varchar,
  	"version_started_at" timestamp(3) with time zone,
  	"version_ended_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  ALTER TABLE "projects" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "projects" ADD COLUMN "url" varchar;
  ALTER TABLE "projects" ADD COLUMN "repository" varchar;
  ALTER TABLE "projects" ADD COLUMN "client" varchar;
  ALTER TABLE "projects" ADD COLUMN "role" varchar;
  ALTER TABLE "projects" ADD COLUMN "started_at" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "ended_at" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "projects" ADD COLUMN "_status" "enum_projects_status" DEFAULT 'draft';
  ALTER TABLE "projects_highlights" ADD CONSTRAINT "projects_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_case_study" ADD CONSTRAINT "projects_case_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_highlights" ADD CONSTRAINT "_projects_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_case_study" ADD CONSTRAINT "_projects_v_version_case_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_texts" ADD CONSTRAINT "_projects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_highlights_order_idx" ON "projects_highlights" USING btree ("_order");
  CREATE INDEX "projects_highlights_parent_id_idx" ON "projects_highlights" USING btree ("_parent_id");
  CREATE INDEX "projects_case_study_order_idx" ON "projects_case_study" USING btree ("_order");
  CREATE INDEX "projects_case_study_parent_id_idx" ON "projects_case_study" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_lyovsons_id_idx" ON "projects_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_projects_v_version_highlights_order_idx" ON "_projects_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_projects_v_version_highlights_parent_id_idx" ON "_projects_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_case_study_order_idx" ON "_projects_v_version_case_study" USING btree ("_order");
  CREATE INDEX "_projects_v_version_case_study_parent_id_idx" ON "_projects_v_version_case_study" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_image_idx" ON "_projects_v" USING btree ("version_image_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_texts_order_parent" ON "_projects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_lyovsons_id_idx" ON "_projects_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");`);

  // Projects predate drafts: keep every existing one published.
  await db.execute(sql`
   UPDATE "projects" SET "_status" = 'published', "published_at" = "created_at";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_case_study" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_case_study" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_highlights" CASCADE;
  DROP TABLE "projects_case_study" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_highlights" CASCADE;
  DROP TABLE "_projects_v_version_case_study" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_texts" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP INDEX "projects__status_idx";
  ALTER TABLE "projects" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "projects" DROP COLUMN "url";
  ALTER TABLE "projects" DROP COLUMN "repository";
  ALTER TABLE "projects" DROP COLUMN "client";
  ALTER TABLE "projects" DROP COLUMN "role";
  ALTER TABLE "projects" DROP COLUMN "started_at";
  ALTER TABLE "projects" DROP COLUMN "ended_at";
  ALTER TABLE "projects" DROP COLUMN "published_at";
  ALTER TABLE "projects" DROP COLUMN "_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";`);
}
