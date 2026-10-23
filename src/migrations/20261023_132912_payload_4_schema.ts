import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
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
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_lyovsons_id_idx" ON "payload_llm_instructions_rels" USING btree ("lyovsons_id");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_llm_instructions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_llm_instructions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP INDEX "media_original_original_filename_idx";
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
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`)
}
