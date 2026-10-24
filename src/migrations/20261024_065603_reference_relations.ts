import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_references_credits_role" AS ENUM('author', 'creator', 'developer', 'director', 'host', 'narrator', 'performer', 'translator');
  CREATE TYPE "public"."enum__references_v_version_credits_role" AS ENUM('author', 'creator', 'developer', 'director', 'host', 'narrator', 'performer', 'translator');
  CREATE TABLE "references_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"agent_id" integer,
  	"role" "enum_references_credits_role"
  );
  
  CREATE TABLE "references_part_of" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"whole_id" integer,
  	"position" numeric,
  	"label" varchar
  );
  
  CREATE TABLE "references_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"member_id" integer,
  	"start" numeric,
  	"end" numeric,
  	"role" varchar
  );
  
  CREATE TABLE "_references_v_version_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"agent_id" integer,
  	"role" "enum__references_v_version_credits_role",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_references_v_version_part_of" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"whole_id" integer,
  	"position" numeric,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_references_v_version_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer,
  	"start" numeric,
  	"end" numeric,
  	"role" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "references" DROP CONSTRAINT "references_series_id_references_id_fk";
  
  ALTER TABLE "_references_v" DROP CONSTRAINT "_references_v_version_series_id_references_id_fk";
  
  DROP INDEX "references_series_idx";
  DROP INDEX "_references_v_version_version_series_idx";
  ALTER TABLE "references_rels" ADD COLUMN "references_id" integer;
  ALTER TABLE "_references_v_rels" ADD COLUMN "references_id" integer;
  ALTER TABLE "references_credits" ADD CONSTRAINT "references_credits_agent_id_references_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references_credits" ADD CONSTRAINT "references_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_part_of" ADD CONSTRAINT "references_part_of_whole_id_references_id_fk" FOREIGN KEY ("whole_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references_part_of" ADD CONSTRAINT "references_part_of_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_members" ADD CONSTRAINT "references_members_member_id_references_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references_members" ADD CONSTRAINT "references_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_credits" ADD CONSTRAINT "_references_v_version_credits_agent_id_references_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v_version_credits" ADD CONSTRAINT "_references_v_version_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_part_of" ADD CONSTRAINT "_references_v_version_part_of_whole_id_references_id_fk" FOREIGN KEY ("whole_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v_version_part_of" ADD CONSTRAINT "_references_v_version_part_of_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_members" ADD CONSTRAINT "_references_v_version_members_member_id_references_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v_version_members" ADD CONSTRAINT "_references_v_version_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "references_credits_order_idx" ON "references_credits" USING btree ("_order");
  CREATE INDEX "references_credits_parent_id_idx" ON "references_credits" USING btree ("_parent_id");
  CREATE INDEX "references_credits_agent_idx" ON "references_credits" USING btree ("agent_id");
  CREATE INDEX "references_part_of_order_idx" ON "references_part_of" USING btree ("_order");
  CREATE INDEX "references_part_of_parent_id_idx" ON "references_part_of" USING btree ("_parent_id");
  CREATE INDEX "references_part_of_whole_idx" ON "references_part_of" USING btree ("whole_id");
  CREATE INDEX "references_members_order_idx" ON "references_members" USING btree ("_order");
  CREATE INDEX "references_members_parent_id_idx" ON "references_members" USING btree ("_parent_id");
  CREATE INDEX "references_members_member_idx" ON "references_members" USING btree ("member_id");
  CREATE INDEX "_references_v_version_credits_order_idx" ON "_references_v_version_credits" USING btree ("_order");
  CREATE INDEX "_references_v_version_credits_parent_id_idx" ON "_references_v_version_credits" USING btree ("_parent_id");
  CREATE INDEX "_references_v_version_credits_agent_idx" ON "_references_v_version_credits" USING btree ("agent_id");
  CREATE INDEX "_references_v_version_part_of_order_idx" ON "_references_v_version_part_of" USING btree ("_order");
  CREATE INDEX "_references_v_version_part_of_parent_id_idx" ON "_references_v_version_part_of" USING btree ("_parent_id");
  CREATE INDEX "_references_v_version_part_of_whole_idx" ON "_references_v_version_part_of" USING btree ("whole_id");
  CREATE INDEX "_references_v_version_members_order_idx" ON "_references_v_version_members" USING btree ("_order");
  CREATE INDEX "_references_v_version_members_parent_id_idx" ON "_references_v_version_members" USING btree ("_parent_id");
  CREATE INDEX "_references_v_version_members_member_idx" ON "_references_v_version_members" USING btree ("member_id");
  ALTER TABLE "references_rels" ADD CONSTRAINT "references_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_rels" ADD CONSTRAINT "_references_v_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "references_rels_references_id_idx" ON "references_rels" USING btree ("references_id");
  CREATE INDEX "_references_v_rels_references_id_idx" ON "_references_v_rels" USING btree ("references_id");
  -- The single series link becomes the first "part of" row.
  INSERT INTO "references_part_of" ("_order", "_parent_id", "id", "whole_id")
  SELECT 1, "id", substr(md5(random()::text || "id"::text), 1, 24), "series_id"
  FROM "references" WHERE "series_id" IS NOT NULL;
  INSERT INTO "_references_v_version_part_of" ("_order", "_parent_id", "whole_id", "_uuid")
  SELECT 1, "id", "version_series_id", substr(md5(random()::text || "id"::text), 1, 24)
  FROM "_references_v" WHERE "version_series_id" IS NOT NULL;
  ALTER TABLE "references" DROP COLUMN "series_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_series_id";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The first "part of" row goes back to the single series link.
  await db.execute(sql`
   ALTER TABLE "references" ADD COLUMN "series_id" integer;
  ALTER TABLE "_references_v" ADD COLUMN "version_series_id" integer;
  UPDATE "references" r SET "series_id" = p."whole_id"
  FROM "references_part_of" p WHERE p."_parent_id" = r."id" AND p."_order" = 1;
  UPDATE "_references_v" v SET "version_series_id" = p."whole_id"
  FROM "_references_v_version_part_of" p WHERE p."_parent_id" = v."id" AND p."_order" = 1;`);
  await db.execute(sql`
   ALTER TABLE "references_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_part_of" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_part_of" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "references_credits" CASCADE;
  DROP TABLE "references_part_of" CASCADE;
  DROP TABLE "references_members" CASCADE;
  DROP TABLE "_references_v_version_credits" CASCADE;
  DROP TABLE "_references_v_version_part_of" CASCADE;
  DROP TABLE "_references_v_version_members" CASCADE;
  ALTER TABLE "references_rels" DROP CONSTRAINT "references_rels_references_fk";
  
  ALTER TABLE "_references_v_rels" DROP CONSTRAINT "_references_v_rels_references_fk";
  
  DROP INDEX "references_rels_references_id_idx";
  DROP INDEX "_references_v_rels_references_id_idx";
  ALTER TABLE "references" ADD CONSTRAINT "references_series_id_references_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_series_id_references_id_fk" FOREIGN KEY ("version_series_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "references_series_idx" ON "references" USING btree ("series_id");
  CREATE INDEX "_references_v_version_version_series_idx" ON "_references_v" USING btree ("version_series_id");
  ALTER TABLE "references_rels" DROP COLUMN "references_id";
  ALTER TABLE "_references_v_rels" DROP COLUMN "references_id";
  DROP TYPE "public"."enum_references_credits_role";
  DROP TYPE "public"."enum__references_v_version_credits_role";`);
}
