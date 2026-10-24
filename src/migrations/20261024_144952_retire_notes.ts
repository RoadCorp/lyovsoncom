import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Global search ranks through hybrid_search_content, which read notes
  // through hybrid_search_notes. SQL function bodies aren't dependency-tracked,
  // so replace them before the tables go.
  await db.execute(sql`
  CREATE OR REPLACE FUNCTION public.hybrid_search_content(query_text text, query_embedding vector, match_count integer DEFAULT 10, rrf_k integer DEFAULT 60)
   RETURNS TABLE(collection character varying, id integer, title character varying, slug character varying, description character varying, featured_image_id integer, created_at timestamp with time zone, updated_at timestamp with time zone, semantic_rank bigint, fts_rank bigint, fuzzy_rank bigint, combined_score numeric)
   LANGUAGE sql
  AS $function$
  SELECT * FROM (
    SELECT 'posts'::VARCHAR AS collection, p.id, p.title, p.slug, p.description, p.featured_image_id, p.created_at, p.updated_at, p.semantic_rank, p.fts_rank, p.fuzzy_rank, p.combined_score
    FROM hybrid_search_posts(query_text, query_embedding, match_count, rrf_k) p
    UNION ALL
    SELECT 'activities'::VARCHAR AS collection, a.id, a.title, a.slug, a.description, a.featured_image_id, a.created_at, a.updated_at, a.semantic_rank, a.fts_rank, a.fuzzy_rank, a.combined_score
    FROM hybrid_search_activities(query_text, query_embedding, match_count, rrf_k) a
  ) r
  ORDER BY r.combined_score DESC
  LIMIT match_count
  $function$;
  DROP FUNCTION IF EXISTS public.hybrid_search_notes(text, vector, integer, integer);`);

  await db.execute(sql`
   ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notes_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "notes_rels" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "_notes_v_rels" CASCADE;
  -- DROP TABLE ... CASCADE has already removed these foreign keys.
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_notes_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_notes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_notes_fk";
  
  DROP INDEX IF EXISTS "posts_rels_notes_id_idx";
  DROP INDEX IF EXISTS "_posts_v_rels_notes_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_notes_id_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "notes_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "notes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notes_id";
  DROP TYPE "public"."enum_notes_type";
  DROP TYPE "public"."enum_notes_author";
  DROP TYPE "public"."enum_notes_visibility";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_type";
  DROP TYPE "public"."enum__notes_v_version_author";
  DROP TYPE "public"."enum__notes_v_version_visibility";
  DROP TYPE "public"."enum__notes_v_version_status";`);
}

// Down recreates empty notes tables; global search keeps skipping notes. The
// notes themselves come back only from the backup branch.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notes_type" AS ENUM('quote', 'thought');
  CREATE TYPE "public"."enum_notes_author" AS ENUM('rafa', 'jess');
  CREATE TYPE "public"."enum_notes_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_type" AS ENUM('quote', 'thought');
  CREATE TYPE "public"."enum__notes_v_version_author" AS ENUM('rafa', 'jess');
  CREATE TYPE "public"."enum__notes_v_version_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_notes_type" DEFAULT 'thought',
  	"author" "enum_notes_author",
  	"visibility" "enum_notes_visibility" DEFAULT 'public',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"content" jsonb,
  	"source_reference_id" integer,
  	"quoted_person" varchar,
  	"page_number" varchar,
  	"published_at" timestamp(3) with time zone,
  	"embedding_vector" varchar,
  	"embedding_model" varchar,
  	"embedding_dimensions" numeric,
  	"embedding_generated_at" timestamp(3) with time zone,
  	"embedding_text_hash" varchar,
  	"recommended_note_ids" jsonb,
  	"content_text" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_notes_status" DEFAULT 'draft',
  	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english',
                      coalesce("notes"."title", '') || ' ' ||
                      coalesce("notes"."content_text", '')
                    )) STORED NOT NULL
  );
  
  CREATE TABLE "notes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer,
  	"posts_id" integer,
  	"references_id" integer,
  	"notes_id" integer,
  	"lyovsons_id" integer,
  	"agents_id" integer
  );
  
  CREATE TABLE "_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__notes_v_version_type" DEFAULT 'thought',
  	"version_author" "enum__notes_v_version_author",
  	"version_visibility" "enum__notes_v_version_visibility" DEFAULT 'public',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_content" jsonb,
  	"version_source_reference_id" integer,
  	"version_quoted_person" varchar,
  	"version_page_number" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_embedding_vector" varchar,
  	"version_embedding_model" varchar,
  	"version_embedding_dimensions" numeric,
  	"version_embedding_generated_at" timestamp(3) with time zone,
  	"version_embedding_text_hash" varchar,
  	"version_recommended_note_ids" jsonb,
  	"version_content_text" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__notes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_notes_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer,
  	"posts_id" integer,
  	"references_id" integer,
  	"notes_id" integer,
  	"lyovsons_id" integer,
  	"agents_id" integer
  );
  
  ALTER TABLE "posts_rels" ADD COLUMN "notes_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "notes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notes_id" integer;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_source_reference_id_references_id_fk" FOREIGN KEY ("source_reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_source_reference_id_references_id_fk" FOREIGN KEY ("version_source_reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "notes_seo_seo_image_idx" ON "notes" USING btree ("seo_image_id");
  CREATE INDEX "notes_source_reference_idx" ON "notes" USING btree ("source_reference_id");
  CREATE UNIQUE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");
  CREATE INDEX "notes_updated_at_idx" ON "notes" USING btree ("updated_at");
  CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");
  CREATE INDEX "notes_deleted_at_idx" ON "notes" USING btree ("deleted_at");
  CREATE INDEX "notes__status_idx" ON "notes" USING btree ("_status");
  CREATE INDEX "notes_rels_order_idx" ON "notes_rels" USING btree ("order");
  CREATE INDEX "notes_rels_parent_idx" ON "notes_rels" USING btree ("parent_id");
  CREATE INDEX "notes_rels_path_idx" ON "notes_rels" USING btree ("path");
  CREATE INDEX "notes_rels_topics_id_idx" ON "notes_rels" USING btree ("topics_id");
  CREATE INDEX "notes_rels_posts_id_idx" ON "notes_rels" USING btree ("posts_id");
  CREATE INDEX "notes_rels_references_id_idx" ON "notes_rels" USING btree ("references_id");
  CREATE INDEX "notes_rels_notes_id_idx" ON "notes_rels" USING btree ("notes_id");
  CREATE INDEX "notes_rels_lyovsons_id_idx" ON "notes_rels" USING btree ("lyovsons_id");
  CREATE INDEX "notes_rels_agents_id_idx" ON "notes_rels" USING btree ("agents_id");
  CREATE INDEX "_notes_v_parent_idx" ON "_notes_v" USING btree ("parent_id");
  CREATE INDEX "_notes_v_version_seo_version_seo_image_idx" ON "_notes_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_notes_v_version_version_source_reference_idx" ON "_notes_v" USING btree ("version_source_reference_id");
  CREATE INDEX "_notes_v_version_version_slug_idx" ON "_notes_v" USING btree ("version_slug");
  CREATE INDEX "_notes_v_version_version_updated_at_idx" ON "_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_notes_v_version_version_created_at_idx" ON "_notes_v" USING btree ("version_created_at");
  CREATE INDEX "_notes_v_version_version_deleted_at_idx" ON "_notes_v" USING btree ("version_deleted_at");
  CREATE INDEX "_notes_v_version_version__status_idx" ON "_notes_v" USING btree ("version__status");
  CREATE INDEX "_notes_v_created_at_idx" ON "_notes_v" USING btree ("created_at");
  CREATE INDEX "_notes_v_updated_at_idx" ON "_notes_v" USING btree ("updated_at");
  CREATE INDEX "_notes_v_latest_idx" ON "_notes_v" USING btree ("latest");
  CREATE INDEX "_notes_v_autosave_idx" ON "_notes_v" USING btree ("autosave");
  CREATE INDEX "_notes_v_rels_order_idx" ON "_notes_v_rels" USING btree ("order");
  CREATE INDEX "_notes_v_rels_parent_idx" ON "_notes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_notes_v_rels_path_idx" ON "_notes_v_rels" USING btree ("path");
  CREATE INDEX "_notes_v_rels_topics_id_idx" ON "_notes_v_rels" USING btree ("topics_id");
  CREATE INDEX "_notes_v_rels_posts_id_idx" ON "_notes_v_rels" USING btree ("posts_id");
  CREATE INDEX "_notes_v_rels_references_id_idx" ON "_notes_v_rels" USING btree ("references_id");
  CREATE INDEX "_notes_v_rels_notes_id_idx" ON "_notes_v_rels" USING btree ("notes_id");
  CREATE INDEX "_notes_v_rels_lyovsons_id_idx" ON "_notes_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_notes_v_rels_agents_id_idx" ON "_notes_v_rels" USING btree ("agents_id");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_notes_id_idx" ON "posts_rels" USING btree ("notes_id");
  CREATE INDEX "_posts_v_rels_notes_id_idx" ON "_posts_v_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");`);
}
