import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "agents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"lyovson_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"api_key" varchar,
  	"api_key_last4" varchar,
  	"api_key_index" varchar
  );
  
  CREATE TABLE "agents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer,
  	"agents_id" integer
  );
  
  ALTER TABLE "posts_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "media_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_media_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "topics_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_topics_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "projects_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_projects_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "lyovsons_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "references_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_references_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "activities_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_activities_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "notes_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "_notes_v_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "payload_llm_instructions_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_lyovson_id_lyovsons_id_fk" FOREIGN KEY ("lyovson_id") REFERENCES "public"."lyovsons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents_rels" ADD CONSTRAINT "agents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agents_rels" ADD CONSTRAINT "agents_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agents_rels" ADD CONSTRAINT "agents_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "agents_lyovson_idx" ON "agents" USING btree ("lyovson_id");
  CREATE INDEX "agents_updated_at_idx" ON "agents" USING btree ("updated_at");
  CREATE INDEX "agents_created_at_idx" ON "agents" USING btree ("created_at");
  CREATE INDEX "agents_rels_order_idx" ON "agents_rels" USING btree ("order");
  CREATE INDEX "agents_rels_parent_idx" ON "agents_rels" USING btree ("parent_id");
  CREATE INDEX "agents_rels_path_idx" ON "agents_rels" USING btree ("path");
  CREATE INDEX "agents_rels_lyovsons_id_idx" ON "agents_rels" USING btree ("lyovsons_id");
  CREATE INDEX "agents_rels_agents_id_idx" ON "agents_rels" USING btree ("agents_id");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons_rels" ADD CONSTRAINT "lyovsons_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_rels" ADD CONSTRAINT "references_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_rels" ADD CONSTRAINT "_references_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities_rels" ADD CONSTRAINT "activities_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_activities_v_rels" ADD CONSTRAINT "_activities_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_agents_id_idx" ON "posts_rels" USING btree ("agents_id");
  CREATE INDEX "_posts_v_rels_agents_id_idx" ON "_posts_v_rels" USING btree ("agents_id");
  CREATE INDEX "media_rels_agents_id_idx" ON "media_rels" USING btree ("agents_id");
  CREATE INDEX "_media_v_rels_agents_id_idx" ON "_media_v_rels" USING btree ("agents_id");
  CREATE INDEX "topics_rels_agents_id_idx" ON "topics_rels" USING btree ("agents_id");
  CREATE INDEX "_topics_v_rels_agents_id_idx" ON "_topics_v_rels" USING btree ("agents_id");
  CREATE INDEX "projects_rels_agents_id_idx" ON "projects_rels" USING btree ("agents_id");
  CREATE INDEX "_projects_v_rels_agents_id_idx" ON "_projects_v_rels" USING btree ("agents_id");
  CREATE INDEX "lyovsons_rels_agents_id_idx" ON "lyovsons_rels" USING btree ("agents_id");
  CREATE INDEX "references_rels_agents_id_idx" ON "references_rels" USING btree ("agents_id");
  CREATE INDEX "_references_v_rels_agents_id_idx" ON "_references_v_rels" USING btree ("agents_id");
  CREATE INDEX "activities_rels_agents_id_idx" ON "activities_rels" USING btree ("agents_id");
  CREATE INDEX "_activities_v_rels_agents_id_idx" ON "_activities_v_rels" USING btree ("agents_id");
  CREATE INDEX "notes_rels_agents_id_idx" ON "notes_rels" USING btree ("agents_id");
  CREATE INDEX "_notes_v_rels_agents_id_idx" ON "_notes_v_rels" USING btree ("agents_id");
  CREATE INDEX "payload_locked_documents_rels_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("agents_id");
  CREATE INDEX "payload_preferences_rels_agents_id_idx" ON "payload_preferences_rels" USING btree ("agents_id");
  CREATE INDEX "payload_llm_instructions_rels_agents_id_idx" ON "payload_llm_instructions_rels" USING btree ("agents_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "agents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agents_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "agents" CASCADE;
  DROP TABLE "agents_rels" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_agents_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_agents_fk";
  
  ALTER TABLE "media_rels" DROP CONSTRAINT "media_rels_agents_fk";
  
  ALTER TABLE "_media_v_rels" DROP CONSTRAINT "_media_v_rels_agents_fk";
  
  ALTER TABLE "topics_rels" DROP CONSTRAINT "topics_rels_agents_fk";
  
  ALTER TABLE "_topics_v_rels" DROP CONSTRAINT "_topics_v_rels_agents_fk";
  
  ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_agents_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_agents_fk";
  
  ALTER TABLE "lyovsons_rels" DROP CONSTRAINT "lyovsons_rels_agents_fk";
  
  ALTER TABLE "references_rels" DROP CONSTRAINT "references_rels_agents_fk";
  
  ALTER TABLE "_references_v_rels" DROP CONSTRAINT "_references_v_rels_agents_fk";
  
  ALTER TABLE "activities_rels" DROP CONSTRAINT "activities_rels_agents_fk";
  
  ALTER TABLE "_activities_v_rels" DROP CONSTRAINT "_activities_v_rels_agents_fk";
  
  ALTER TABLE "notes_rels" DROP CONSTRAINT "notes_rels_agents_fk";
  
  ALTER TABLE "_notes_v_rels" DROP CONSTRAINT "_notes_v_rels_agents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_agents_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_agents_fk";
  
  ALTER TABLE "payload_llm_instructions_rels" DROP CONSTRAINT "payload_llm_instructions_rels_agents_fk";
  
  DROP INDEX "posts_rels_agents_id_idx";
  DROP INDEX "_posts_v_rels_agents_id_idx";
  DROP INDEX "media_rels_agents_id_idx";
  DROP INDEX "_media_v_rels_agents_id_idx";
  DROP INDEX "topics_rels_agents_id_idx";
  DROP INDEX "_topics_v_rels_agents_id_idx";
  DROP INDEX "projects_rels_agents_id_idx";
  DROP INDEX "_projects_v_rels_agents_id_idx";
  DROP INDEX "lyovsons_rels_agents_id_idx";
  DROP INDEX "references_rels_agents_id_idx";
  DROP INDEX "_references_v_rels_agents_id_idx";
  DROP INDEX "activities_rels_agents_id_idx";
  DROP INDEX "_activities_v_rels_agents_id_idx";
  DROP INDEX "notes_rels_agents_id_idx";
  DROP INDEX "_notes_v_rels_agents_id_idx";
  DROP INDEX "payload_locked_documents_rels_agents_id_idx";
  DROP INDEX "payload_preferences_rels_agents_id_idx";
  DROP INDEX "payload_llm_instructions_rels_agents_id_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "media_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_media_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "topics_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_topics_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "projects_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_projects_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "lyovsons_rels" DROP COLUMN "agents_id";
  ALTER TABLE "references_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_references_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "activities_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_activities_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "notes_rels" DROP COLUMN "agents_id";
  ALTER TABLE "_notes_v_rels" DROP COLUMN "agents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "agents_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "agents_id";
  ALTER TABLE "payload_llm_instructions_rels" DROP COLUMN "agents_id";`);
}
