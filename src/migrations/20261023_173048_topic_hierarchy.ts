import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// The nested-docs plugin's breadcrumbs. Run after the deploy: the previous
// build still reads them.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "topics_breadcrumbs" CASCADE;
  DROP TABLE "_topics_v_version_breadcrumbs" CASCADE;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "topics_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
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
  
  ALTER TABLE "topics_breadcrumbs" ADD CONSTRAINT "topics_breadcrumbs_doc_id_topics_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_breadcrumbs" ADD CONSTRAINT "topics_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_version_breadcrumbs" ADD CONSTRAINT "_topics_v_version_breadcrumbs_doc_id_topics_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_version_breadcrumbs" ADD CONSTRAINT "_topics_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "topics_breadcrumbs_order_idx" ON "topics_breadcrumbs" USING btree ("_order");
  CREATE INDEX "topics_breadcrumbs_parent_id_idx" ON "topics_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "topics_breadcrumbs_doc_idx" ON "topics_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_topics_v_version_breadcrumbs_order_idx" ON "_topics_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_topics_v_version_breadcrumbs_parent_id_idx" ON "_topics_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_version_breadcrumbs_doc_idx" ON "_topics_v_version_breadcrumbs" USING btree ("doc_id");`);
}
