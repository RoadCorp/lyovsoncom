import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Data first: empty drafts nothing links to, version rows that would break
  // the new NOT NULL columns, and "Artist - Album" music titles split into
  // creator and title.
  await db.execute(sql`
  DELETE FROM "references" r
    WHERE r.title IS NULL
      AND NOT EXISTS (SELECT 1 FROM "activities" a WHERE a.reference_id = r.id)
      AND NOT EXISTS (SELECT 1 FROM "posts_rels" p WHERE p.references_id = r.id)
      AND NOT EXISTS (SELECT 1 FROM "notes_rels" n WHERE n.references_id = r.id);
  DELETE FROM "_references_v"
    WHERE version_title IS NULL OR version_type IS NULL OR version_slug IS NULL;
  UPDATE "references"
    SET type = 'other'
    WHERE type::text NOT IN ('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'course');
  UPDATE "_references_v"
    SET version_type = 'other'
    WHERE version_type::text NOT IN ('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'course');`);

  await db.execute(sql`
   CREATE TYPE "public"."enum_references_catalog_source" AS ENUM('openLibrary', 'tmdb', 'igdb', 'musicBrainz', 'itunes', 'wikidata');
  CREATE TYPE "public"."enum__references_v_version_catalog_source" AS ENUM('openLibrary', 'tmdb', 'igdb', 'musicBrainz', 'itunes', 'wikidata');
  ALTER TABLE "references_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "references_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_version_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_references_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "references_platforms" CASCADE;
  DROP TABLE "references_roles" CASCADE;
  DROP TABLE "references_links" CASCADE;
  DROP TABLE "references_texts" CASCADE;
  DROP TABLE "_references_v_version_platforms" CASCADE;
  DROP TABLE "_references_v_version_roles" CASCADE;
  DROP TABLE "_references_v_version_links" CASCADE;
  DROP TABLE "_references_v_texts" CASCADE;
  ALTER TABLE "references" DROP CONSTRAINT "references_album_id_references_id_fk";
  
  ALTER TABLE "references" DROP CONSTRAINT "references_show_id_references_id_fk";
  
  ALTER TABLE "_references_v" DROP CONSTRAINT "_references_v_version_album_id_references_id_fk";
  
  ALTER TABLE "_references_v" DROP CONSTRAINT "_references_v_version_show_id_references_id_fk";
  
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_references_type";
  CREATE TYPE "public"."enum_references_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'organization', 'course', 'other');
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE "public"."enum_references_type" USING "type"::"public"."enum_references_type";
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__references_v_version_type";
  CREATE TYPE "public"."enum__references_v_version_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'organization', 'course', 'other');
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__references_v_version_type" USING "version_type"::"public"."enum__references_v_version_type";
  DROP INDEX "references_album_idx";
  DROP INDEX "references_show_idx";
  DROP INDEX "references__status_idx";
  DROP INDEX "_references_v_version_version_album_idx";
  DROP INDEX "_references_v_version_version_show_idx";
  DROP INDEX "_references_v_version_version__status_idx";
  DROP INDEX "_references_v_latest_idx";
  DROP INDEX "_references_v_autosave_idx";
  ALTER TABLE "references" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "references" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "references" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_title" SET NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_slug" SET NOT NULL;
  ALTER TABLE "references" ADD COLUMN "creator" varchar;
  ALTER TABLE "references" ADD COLUMN "year" numeric;
  ALTER TABLE "references" ADD COLUMN "wikidata_id" varchar;
  ALTER TABLE "references" ADD COLUMN "catalog_source" "enum_references_catalog_source";
  ALTER TABLE "references" ADD COLUMN "catalog_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_creator" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_year" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_wikidata_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_catalog_source" "enum__references_v_version_catalog_source";
  ALTER TABLE "_references_v" ADD COLUMN "version_catalog_id" varchar;
  CREATE INDEX "references_wikidata_id_idx" ON "references" USING btree ("wikidata_id");
  CREATE INDEX "_references_v_version_version_wikidata_id_idx" ON "_references_v" USING btree ("version_wikidata_id");
  ALTER TABLE "references" DROP COLUMN "isbn";
  ALTER TABLE "references" DROP COLUMN "publisher";
  ALTER TABLE "references" DROP COLUMN "page_count";
  ALTER TABLE "references" DROP COLUMN "language";
  ALTER TABLE "references" DROP COLUMN "runtime";
  ALTER TABLE "references" DROP COLUMN "mpaa_rating";
  ALTER TABLE "references" DROP COLUMN "network_or_service";
  ALTER TABLE "references" DROP COLUMN "status";
  ALTER TABLE "references" DROP COLUMN "season_number";
  ALTER TABLE "references" DROP COLUMN "episode_number";
  ALTER TABLE "references" DROP COLUMN "esrb_rating";
  ALTER TABLE "references" DROP COLUMN "metacritic_score";
  ALTER TABLE "references" DROP COLUMN "developer";
  ALTER TABLE "references" DROP COLUMN "album_id";
  ALTER TABLE "references" DROP COLUMN "track_number";
  ALTER TABLE "references" DROP COLUMN "label";
  ALTER TABLE "references" DROP COLUMN "barcode";
  ALTER TABLE "references" DROP COLUMN "show_id";
  ALTER TABLE "references" DROP COLUMN "birth_date";
  ALTER TABLE "references" DROP COLUMN "death_date";
  ALTER TABLE "references" DROP COLUMN "nationality";
  ALTER TABLE "references" DROP COLUMN "website";
  ALTER TABLE "references" DROP COLUMN "social_links";
  ALTER TABLE "references" DROP COLUMN "industry";
  ALTER TABLE "references" DROP COLUMN "founded_date";
  ALTER TABLE "references" DROP COLUMN "site_name";
  ALTER TABLE "references" DROP COLUMN "author";
  ALTER TABLE "references" DROP COLUMN "published_at";
  ALTER TABLE "references" DROP COLUMN "platform";
  ALTER TABLE "references" DROP COLUMN "video_id";
  ALTER TABLE "references" DROP COLUMN "instructor";
  ALTER TABLE "references" DROP COLUMN "course_platform";
  ALTER TABLE "references" DROP COLUMN "course_duration";
  ALTER TABLE "references" DROP COLUMN "course_level";
  ALTER TABLE "references" DROP COLUMN "course_url";
  ALTER TABLE "references" DROP COLUMN "external_ids_imdb_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_tvdb_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_spotify_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_apple_music_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_spotify_url";
  ALTER TABLE "references" DROP COLUMN "external_ids_apple_podcasts_url";
  ALTER TABLE "references" DROP COLUMN "external_ids_website_url";
  ALTER TABLE "references" DROP COLUMN "external_ids_steam_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_igdb_id";
  ALTER TABLE "references" DROP COLUMN "external_ids_google_books_id";
  ALTER TABLE "references" DROP COLUMN "_status";
  ALTER TABLE "_references_v" DROP COLUMN "version_isbn";
  ALTER TABLE "_references_v" DROP COLUMN "version_publisher";
  ALTER TABLE "_references_v" DROP COLUMN "version_page_count";
  ALTER TABLE "_references_v" DROP COLUMN "version_language";
  ALTER TABLE "_references_v" DROP COLUMN "version_runtime";
  ALTER TABLE "_references_v" DROP COLUMN "version_mpaa_rating";
  ALTER TABLE "_references_v" DROP COLUMN "version_network_or_service";
  ALTER TABLE "_references_v" DROP COLUMN "version_status";
  ALTER TABLE "_references_v" DROP COLUMN "version_season_number";
  ALTER TABLE "_references_v" DROP COLUMN "version_episode_number";
  ALTER TABLE "_references_v" DROP COLUMN "version_esrb_rating";
  ALTER TABLE "_references_v" DROP COLUMN "version_metacritic_score";
  ALTER TABLE "_references_v" DROP COLUMN "version_developer";
  ALTER TABLE "_references_v" DROP COLUMN "version_album_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_track_number";
  ALTER TABLE "_references_v" DROP COLUMN "version_label";
  ALTER TABLE "_references_v" DROP COLUMN "version_barcode";
  ALTER TABLE "_references_v" DROP COLUMN "version_show_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_birth_date";
  ALTER TABLE "_references_v" DROP COLUMN "version_death_date";
  ALTER TABLE "_references_v" DROP COLUMN "version_nationality";
  ALTER TABLE "_references_v" DROP COLUMN "version_website";
  ALTER TABLE "_references_v" DROP COLUMN "version_social_links";
  ALTER TABLE "_references_v" DROP COLUMN "version_industry";
  ALTER TABLE "_references_v" DROP COLUMN "version_founded_date";
  ALTER TABLE "_references_v" DROP COLUMN "version_site_name";
  ALTER TABLE "_references_v" DROP COLUMN "version_author";
  ALTER TABLE "_references_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_references_v" DROP COLUMN "version_platform";
  ALTER TABLE "_references_v" DROP COLUMN "version_video_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_instructor";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_platform";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_duration";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_level";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_url";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_imdb_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_tvdb_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_spotify_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_apple_music_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_spotify_url";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_apple_podcasts_url";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_website_url";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_steam_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_igdb_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_external_ids_google_books_id";
  ALTER TABLE "_references_v" DROP COLUMN "version__status";
  ALTER TABLE "_references_v" DROP COLUMN "latest";
  ALTER TABLE "_references_v" DROP COLUMN "autosave";
  DROP TYPE "public"."enum_references_platforms";
  DROP TYPE "public"."enum_references_roles";
  DROP TYPE "public"."enum_references_links_kind";
  DROP TYPE "public"."enum_references_mpaa_rating";
  DROP TYPE "public"."enum_references_status";
  DROP TYPE "public"."enum_references_esrb_rating";
  DROP TYPE "public"."enum_references_course_platform";
  DROP TYPE "public"."enum_references_course_level";
  DROP TYPE "public"."enum__references_v_version_platforms";
  DROP TYPE "public"."enum__references_v_version_roles";
  DROP TYPE "public"."enum__references_v_version_links_kind";
  DROP TYPE "public"."enum__references_v_version_mpaa_rating";
  DROP TYPE "public"."enum__references_v_version_status";
  DROP TYPE "public"."enum__references_v_version_esrb_rating";
  DROP TYPE "public"."enum__references_v_version_course_platform";
  DROP TYPE "public"."enum__references_v_version_course_level";`);

  await db.execute(sql`
  UPDATE "references"
    SET creator = split_part(title, ' - ', 1),
        title = substr(title, length(split_part(title, ' - ', 1)) + 4)
    WHERE type = 'music' AND creator IS NULL AND title LIKE '% - %';`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_references_platforms" AS ENUM('pc', 'playstation', 'xbox', 'switch', 'mobile', 'vr');
  CREATE TYPE "public"."enum_references_roles" AS ENUM('author', 'director', 'actor', 'musician', 'developer', 'host', 'publicFigure');
  CREATE TYPE "public"."enum_references_links_kind" AS ENUM('purchase', 'streaming', 'official', 'social', 'other');
  CREATE TYPE "public"."enum_references_mpaa_rating" AS ENUM('g', 'pg', 'pg13', 'r', 'nc17', 'nr');
  CREATE TYPE "public"."enum_references_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_references_esrb_rating" AS ENUM('e', 'e10', 't', 'm', 'ao');
  CREATE TYPE "public"."enum_references_course_platform" AS ENUM('udemy', 'coursera', 'frontendMasters', 'masterclass', 'pluralsight', 'edx', 'skillshare', 'linkedinLearning', 'egghead', 'youtube', 'other');
  CREATE TYPE "public"."enum_references_course_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum__references_v_version_platforms" AS ENUM('pc', 'playstation', 'xbox', 'switch', 'mobile', 'vr');
  CREATE TYPE "public"."enum__references_v_version_roles" AS ENUM('author', 'director', 'actor', 'musician', 'developer', 'host', 'publicFigure');
  CREATE TYPE "public"."enum__references_v_version_links_kind" AS ENUM('purchase', 'streaming', 'official', 'social', 'other');
  CREATE TYPE "public"."enum__references_v_version_mpaa_rating" AS ENUM('g', 'pg', 'pg13', 'r', 'nc17', 'nr');
  CREATE TYPE "public"."enum__references_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__references_v_version_esrb_rating" AS ENUM('e', 'e10', 't', 'm', 'ao');
  CREATE TYPE "public"."enum__references_v_version_course_platform" AS ENUM('udemy', 'coursera', 'frontendMasters', 'masterclass', 'pluralsight', 'edx', 'skillshare', 'linkedinLearning', 'egghead', 'youtube', 'other');
  CREATE TYPE "public"."enum__references_v_version_course_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TABLE "references_platforms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_references_platforms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "references_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_references_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "references_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"kind" "enum_references_links_kind"
  );
  
  CREATE TABLE "references_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_references_v_version_platforms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__references_v_version_platforms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_references_v_version_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__references_v_version_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_references_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"kind" "enum__references_v_version_links_kind",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_references_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_references_type";
  CREATE TYPE "public"."enum_references_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'course', 'match', 'other');
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE "public"."enum_references_type" USING "type"::"public"."enum_references_type";
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__references_v_version_type";
  CREATE TYPE "public"."enum__references_v_version_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'course', 'match', 'other');
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__references_v_version_type" USING "version_type"::"public"."enum__references_v_version_type";
  DROP INDEX "references_wikidata_id_idx";
  DROP INDEX "_references_v_version_version_wikidata_id_idx";
  ALTER TABLE "references" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "references" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "references" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" DROP NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_title" DROP NOT NULL;
  ALTER TABLE "_references_v" ALTER COLUMN "version_slug" DROP NOT NULL;
  ALTER TABLE "references" ADD COLUMN "isbn" varchar;
  ALTER TABLE "references" ADD COLUMN "publisher" varchar;
  ALTER TABLE "references" ADD COLUMN "page_count" numeric;
  ALTER TABLE "references" ADD COLUMN "language" varchar;
  ALTER TABLE "references" ADD COLUMN "runtime" numeric;
  ALTER TABLE "references" ADD COLUMN "mpaa_rating" "enum_references_mpaa_rating";
  ALTER TABLE "references" ADD COLUMN "network_or_service" varchar;
  ALTER TABLE "references" ADD COLUMN "status" "enum_references_status";
  ALTER TABLE "references" ADD COLUMN "season_number" numeric;
  ALTER TABLE "references" ADD COLUMN "episode_number" numeric;
  ALTER TABLE "references" ADD COLUMN "esrb_rating" "enum_references_esrb_rating";
  ALTER TABLE "references" ADD COLUMN "metacritic_score" numeric;
  ALTER TABLE "references" ADD COLUMN "developer" varchar;
  ALTER TABLE "references" ADD COLUMN "album_id" integer;
  ALTER TABLE "references" ADD COLUMN "track_number" numeric;
  ALTER TABLE "references" ADD COLUMN "label" varchar;
  ALTER TABLE "references" ADD COLUMN "barcode" varchar;
  ALTER TABLE "references" ADD COLUMN "show_id" integer;
  ALTER TABLE "references" ADD COLUMN "birth_date" timestamp(3) with time zone;
  ALTER TABLE "references" ADD COLUMN "death_date" timestamp(3) with time zone;
  ALTER TABLE "references" ADD COLUMN "nationality" varchar;
  ALTER TABLE "references" ADD COLUMN "website" varchar;
  ALTER TABLE "references" ADD COLUMN "social_links" jsonb;
  ALTER TABLE "references" ADD COLUMN "industry" varchar;
  ALTER TABLE "references" ADD COLUMN "founded_date" timestamp(3) with time zone;
  ALTER TABLE "references" ADD COLUMN "site_name" varchar;
  ALTER TABLE "references" ADD COLUMN "author" varchar;
  ALTER TABLE "references" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "references" ADD COLUMN "platform" varchar;
  ALTER TABLE "references" ADD COLUMN "video_id" varchar;
  ALTER TABLE "references" ADD COLUMN "instructor" varchar;
  ALTER TABLE "references" ADD COLUMN "course_platform" "enum_references_course_platform";
  ALTER TABLE "references" ADD COLUMN "course_duration" varchar;
  ALTER TABLE "references" ADD COLUMN "course_level" "enum_references_course_level";
  ALTER TABLE "references" ADD COLUMN "course_url" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_imdb_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_tvdb_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_spotify_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_apple_music_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_spotify_url" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_apple_podcasts_url" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_website_url" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_steam_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_igdb_id" varchar;
  ALTER TABLE "references" ADD COLUMN "external_ids_google_books_id" varchar;
  ALTER TABLE "references" ADD COLUMN "_status" "enum_references_status" DEFAULT 'draft';
  ALTER TABLE "_references_v" ADD COLUMN "version_isbn" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_publisher" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_page_count" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_language" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_runtime" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_mpaa_rating" "enum__references_v_version_mpaa_rating";
  ALTER TABLE "_references_v" ADD COLUMN "version_network_or_service" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_status" "enum__references_v_version_status";
  ALTER TABLE "_references_v" ADD COLUMN "version_season_number" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_episode_number" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_esrb_rating" "enum__references_v_version_esrb_rating";
  ALTER TABLE "_references_v" ADD COLUMN "version_metacritic_score" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_developer" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_album_id" integer;
  ALTER TABLE "_references_v" ADD COLUMN "version_track_number" numeric;
  ALTER TABLE "_references_v" ADD COLUMN "version_label" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_barcode" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_show_id" integer;
  ALTER TABLE "_references_v" ADD COLUMN "version_birth_date" timestamp(3) with time zone;
  ALTER TABLE "_references_v" ADD COLUMN "version_death_date" timestamp(3) with time zone;
  ALTER TABLE "_references_v" ADD COLUMN "version_nationality" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_website" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_social_links" jsonb;
  ALTER TABLE "_references_v" ADD COLUMN "version_industry" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_founded_date" timestamp(3) with time zone;
  ALTER TABLE "_references_v" ADD COLUMN "version_site_name" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_author" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "_references_v" ADD COLUMN "version_platform" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_video_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_instructor" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_course_platform" "enum__references_v_version_course_platform";
  ALTER TABLE "_references_v" ADD COLUMN "version_course_duration" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_course_level" "enum__references_v_version_course_level";
  ALTER TABLE "_references_v" ADD COLUMN "version_course_url" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_imdb_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_tvdb_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_spotify_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_apple_music_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_spotify_url" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_apple_podcasts_url" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_website_url" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_steam_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_igdb_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version_external_ids_google_books_id" varchar;
  ALTER TABLE "_references_v" ADD COLUMN "version__status" "enum__references_v_version_status" DEFAULT 'draft';
  ALTER TABLE "_references_v" ADD COLUMN "latest" boolean;
  ALTER TABLE "_references_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "references_platforms" ADD CONSTRAINT "references_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_roles" ADD CONSTRAINT "references_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_links" ADD CONSTRAINT "references_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_texts" ADD CONSTRAINT "references_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_platforms" ADD CONSTRAINT "_references_v_version_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_roles" ADD CONSTRAINT "_references_v_version_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_links" ADD CONSTRAINT "_references_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_texts" ADD CONSTRAINT "_references_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "references_platforms_order_idx" ON "references_platforms" USING btree ("order");
  CREATE INDEX "references_platforms_parent_idx" ON "references_platforms" USING btree ("parent_id");
  CREATE INDEX "references_roles_order_idx" ON "references_roles" USING btree ("order");
  CREATE INDEX "references_roles_parent_idx" ON "references_roles" USING btree ("parent_id");
  CREATE INDEX "references_links_order_idx" ON "references_links" USING btree ("_order");
  CREATE INDEX "references_links_parent_id_idx" ON "references_links" USING btree ("_parent_id");
  CREATE INDEX "references_texts_order_parent" ON "references_texts" USING btree ("order","parent_id");
  CREATE INDEX "_references_v_version_platforms_order_idx" ON "_references_v_version_platforms" USING btree ("order");
  CREATE INDEX "_references_v_version_platforms_parent_idx" ON "_references_v_version_platforms" USING btree ("parent_id");
  CREATE INDEX "_references_v_version_roles_order_idx" ON "_references_v_version_roles" USING btree ("order");
  CREATE INDEX "_references_v_version_roles_parent_idx" ON "_references_v_version_roles" USING btree ("parent_id");
  CREATE INDEX "_references_v_version_links_order_idx" ON "_references_v_version_links" USING btree ("_order");
  CREATE INDEX "_references_v_version_links_parent_id_idx" ON "_references_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_references_v_texts_order_parent" ON "_references_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "references" ADD CONSTRAINT "references_album_id_references_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_show_id_references_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_album_id_references_id_fk" FOREIGN KEY ("version_album_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_show_id_references_id_fk" FOREIGN KEY ("version_show_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "references_album_idx" ON "references" USING btree ("album_id");
  CREATE INDEX "references_show_idx" ON "references" USING btree ("show_id");
  CREATE INDEX "references__status_idx" ON "references" USING btree ("_status");
  CREATE INDEX "_references_v_version_version_album_idx" ON "_references_v" USING btree ("version_album_id");
  CREATE INDEX "_references_v_version_version_show_idx" ON "_references_v" USING btree ("version_show_id");
  CREATE INDEX "_references_v_version_version__status_idx" ON "_references_v" USING btree ("version__status");
  CREATE INDEX "_references_v_latest_idx" ON "_references_v" USING btree ("latest");
  CREATE INDEX "_references_v_autosave_idx" ON "_references_v" USING btree ("autosave");
  ALTER TABLE "references" DROP COLUMN "creator";
  ALTER TABLE "references" DROP COLUMN "year";
  ALTER TABLE "references" DROP COLUMN "wikidata_id";
  ALTER TABLE "references" DROP COLUMN "catalog_source";
  ALTER TABLE "references" DROP COLUMN "catalog_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_creator";
  ALTER TABLE "_references_v" DROP COLUMN "version_year";
  ALTER TABLE "_references_v" DROP COLUMN "version_wikidata_id";
  ALTER TABLE "_references_v" DROP COLUMN "version_catalog_source";
  ALTER TABLE "_references_v" DROP COLUMN "version_catalog_id";
  DROP TYPE "public"."enum_references_catalog_source";
  DROP TYPE "public"."enum__references_v_version_catalog_source";`);
}
