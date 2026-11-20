import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_type" AS ENUM('article', 'review', 'video', 'podcast', 'photo');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_type" AS ENUM('article', 'review', 'video', 'podcast', 'photo');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lyovsons_social_links_platform" AS ENUM('x', 'linkedin', 'github', 'instagram', 'facebook', 'youtube', 'website');
  CREATE TYPE "public"."enum_lyovsons_font" AS ENUM('sans', 'serif', 'mono');
  CREATE TYPE "public"."enum_contacts_status" AS ENUM('pending', 'active', 'unsubscribed');
  CREATE TYPE "public"."enum_references_platforms" AS ENUM('pc', 'playstation', 'xbox', 'switch', 'mobile', 'vr');
  CREATE TYPE "public"."enum_references_roles" AS ENUM('author', 'director', 'actor', 'musician', 'developer', 'host', 'publicFigure');
  CREATE TYPE "public"."enum_references_links_kind" AS ENUM('purchase', 'streaming', 'official', 'social', 'other');
  CREATE TYPE "public"."enum_references_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'match', 'other');
  CREATE TYPE "public"."enum_references_format" AS ENUM('hardcover', 'paperback', 'ebook', 'audiobook');
  CREATE TYPE "public"."enum_references_mpaa_rating" AS ENUM('g', 'pg', 'pg13', 'r', 'nc17', 'nr');
  CREATE TYPE "public"."enum_references_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_references_esrb_rating" AS ENUM('e', 'e10', 't', 'm', 'ao');
  CREATE TYPE "public"."enum__references_v_version_platforms" AS ENUM('pc', 'playstation', 'xbox', 'switch', 'mobile', 'vr');
  CREATE TYPE "public"."enum__references_v_version_roles" AS ENUM('author', 'director', 'actor', 'musician', 'developer', 'host', 'publicFigure');
  CREATE TYPE "public"."enum__references_v_version_links_kind" AS ENUM('purchase', 'streaming', 'official', 'social', 'other');
  CREATE TYPE "public"."enum__references_v_version_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'match', 'other');
  CREATE TYPE "public"."enum__references_v_version_format" AS ENUM('hardcover', 'paperback', 'ebook', 'audiobook');
  CREATE TYPE "public"."enum__references_v_version_mpaa_rating" AS ENUM('g', 'pg', 'pg13', 'r', 'nc17', 'nr');
  CREATE TYPE "public"."enum__references_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__references_v_version_esrb_rating" AS ENUM('e', 'e10', 't', 'm', 'ao');
  CREATE TYPE "public"."enum_activities_activity_type" AS ENUM('read', 'watch', 'listen', 'play', 'visit');
  CREATE TYPE "public"."enum_activities_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_activities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__activities_v_version_activity_type" AS ENUM('read', 'watch', 'listen', 'play', 'visit');
  CREATE TYPE "public"."enum__activities_v_version_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum__activities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_notes_type" AS ENUM('quote', 'thought');
  CREATE TYPE "public"."enum_notes_author" AS ENUM('rafa', 'jess');
  CREATE TYPE "public"."enum_notes_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_notes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notes_v_version_type" AS ENUM('quote', 'thought');
  CREATE TYPE "public"."enum__notes_v_version_author" AS ENUM('rafa', 'jess');
  CREATE TYPE "public"."enum__notes_v_version_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum__notes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'generateEmbedding', 'computeRecommendations');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_workflow_slug" AS ENUM('processPostEmbeddings');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'generateEmbedding', 'computeRecommendations');
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"username" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"featured_image_id" integer,
  	"description" varchar,
  	"content" jsonb,
  	"type" "enum_posts_type" DEFAULT 'article',
  	"rating" numeric,
  	"video_embed_url" varchar,
  	"podcast_embed_url" varchar,
  	"project_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"recommended_post_ids" jsonb,
  	"content_text" varchar,
  	"embedding_vector" varchar,
  	"embedding_model" varchar,
  	"embedding_dimensions" numeric,
  	"embedding_generated_at" timestamp(3) with time zone,
  	"embedding_text_hash" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft',
  	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english',
                      coalesce("posts"."title", '') || ' ' ||
                      coalesce("posts"."description", '') || ' ' ||
                      coalesce("posts"."content_text", '')
                    )) STORED NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"references_id" integer,
  	"topics_id" integer,
  	"notes_id" integer,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar,
  	"username" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_featured_image_id" integer,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_type" "enum__posts_v_version_type" DEFAULT 'article',
  	"version_rating" numeric,
  	"version_video_embed_url" varchar,
  	"version_podcast_embed_url" varchar,
  	"version_project_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_recommended_post_ids" jsonb,
  	"version_content_text" varchar,
  	"version_embedding_vector" varchar,
  	"version_embedding_model" varchar,
  	"version_embedding_dimensions" numeric,
  	"version_embedding_generated_at" timestamp(3) with time zone,
  	"version_embedding_text_hash" varchar,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"references_id" integer,
  	"topics_id" integer,
  	"notes_id" integer,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "topics_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"resend_audience_id" varchar DEFAULT 'a34b0804-8e96-421c-8065-e9dc35277c1d',
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"contacts_id" integer
  );
  
  CREATE TABLE "lyovsons_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_lyovsons_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "lyovsons_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "lyovsons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"avatar_id" integer,
  	"font" "enum_lyovsons_font" DEFAULT 'sans',
  	"name" varchar NOT NULL,
  	"username" varchar NOT NULL,
  	"quote" varchar,
  	"bio" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"confirmation_token" varchar,
  	"confirmation_expiry" timestamp(3) with time zone,
  	"unsubscribed" boolean DEFAULT false,
  	"status" "enum_contacts_status" DEFAULT 'pending',
  	"project_id" integer,
  	"resend_contact_id" varchar,
  	"subscribed_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  CREATE TABLE "references" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_references_type",
  	"image_id" integer,
  	"description" varchar,
  	"isbn" varchar,
  	"publisher" varchar,
  	"page_count" numeric,
  	"language" varchar,
  	"format" "enum_references_format",
  	"series_id" integer,
  	"runtime" numeric,
  	"mpaa_rating" "enum_references_mpaa_rating",
  	"network_or_service" varchar,
  	"status" "enum_references_status",
  	"season_number" numeric,
  	"episode_number" numeric,
  	"esrb_rating" "enum_references_esrb_rating",
  	"metacritic_score" numeric,
  	"developer" varchar,
  	"album_id" integer,
  	"track_number" numeric,
  	"label" varchar,
  	"barcode" varchar,
  	"show_id" integer,
  	"birth_date" timestamp(3) with time zone,
  	"death_date" timestamp(3) with time zone,
  	"nationality" varchar,
  	"website" varchar,
  	"social_links" jsonb,
  	"industry" varchar,
  	"founded_date" timestamp(3) with time zone,
  	"url" varchar,
  	"site_name" varchar,
  	"author" varchar,
  	"published_at" timestamp(3) with time zone,
  	"platform" varchar,
  	"video_id" varchar,
  	"external_ids_imdb_id" varchar,
  	"external_ids_tvdb_id" varchar,
  	"external_ids_spotify_id" varchar,
  	"external_ids_apple_music_id" varchar,
  	"external_ids_spotify_url" varchar,
  	"external_ids_apple_podcasts_url" varchar,
  	"external_ids_website_url" varchar,
  	"external_ids_steam_id" varchar,
  	"external_ids_igdb_id" varchar,
  	"external_ids_google_books_id" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_references_status" DEFAULT 'draft'
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
  
  CREATE TABLE "_references_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__references_v_version_type",
  	"version_image_id" integer,
  	"version_description" varchar,
  	"version_isbn" varchar,
  	"version_publisher" varchar,
  	"version_page_count" numeric,
  	"version_language" varchar,
  	"version_format" "enum__references_v_version_format",
  	"version_series_id" integer,
  	"version_runtime" numeric,
  	"version_mpaa_rating" "enum__references_v_version_mpaa_rating",
  	"version_network_or_service" varchar,
  	"version_status" "enum__references_v_version_status",
  	"version_season_number" numeric,
  	"version_episode_number" numeric,
  	"version_esrb_rating" "enum__references_v_version_esrb_rating",
  	"version_metacritic_score" numeric,
  	"version_developer" varchar,
  	"version_album_id" integer,
  	"version_track_number" numeric,
  	"version_label" varchar,
  	"version_barcode" varchar,
  	"version_show_id" integer,
  	"version_birth_date" timestamp(3) with time zone,
  	"version_death_date" timestamp(3) with time zone,
  	"version_nationality" varchar,
  	"version_website" varchar,
  	"version_social_links" jsonb,
  	"version_industry" varchar,
  	"version_founded_date" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_site_name" varchar,
  	"version_author" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_platform" varchar,
  	"version_video_id" varchar,
  	"version_external_ids_imdb_id" varchar,
  	"version_external_ids_tvdb_id" varchar,
  	"version_external_ids_spotify_id" varchar,
  	"version_external_ids_apple_music_id" varchar,
  	"version_external_ids_spotify_url" varchar,
  	"version_external_ids_apple_podcasts_url" varchar,
  	"version_external_ids_website_url" varchar,
  	"version_external_ids_steam_id" varchar,
  	"version_external_ids_igdb_id" varchar,
  	"version_external_ids_google_books_id" varchar,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__references_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_references_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "activities_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lyovson_id" integer,
  	"note" varchar,
  	"rating" numeric
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_id" integer,
  	"activity_type" "enum_activities_activity_type",
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"visibility" "enum_activities_visibility" DEFAULT 'public',
  	"notes" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"slug_source" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"embedding_vector" varchar,
  	"embedding_model" varchar,
  	"embedding_dimensions" numeric,
  	"embedding_generated_at" timestamp(3) with time zone,
  	"embedding_text_hash" varchar,
  	"content_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_activities_status" DEFAULT 'draft',
  	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english',
                      coalesce("activities"."content_text", '')
                    )) STORED NOT NULL
  );
  
  CREATE TABLE "activities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "_activities_v_version_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"lyovson_id" integer,
  	"note" varchar,
  	"rating" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_activities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_reference_id" integer,
  	"version_activity_type" "enum__activities_v_version_activity_type",
  	"version_started_at" timestamp(3) with time zone,
  	"version_finished_at" timestamp(3) with time zone,
  	"version_visibility" "enum__activities_v_version_visibility" DEFAULT 'public',
  	"version_notes" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug_source" varchar,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_embedding_vector" varchar,
  	"version_embedding_model" varchar,
  	"version_embedding_dimensions" numeric,
  	"version_embedding_generated_at" timestamp(3) with time zone,
  	"version_embedding_text_hash" varchar,
  	"version_content_text" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__activities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_activities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_notes_type" DEFAULT 'thought',
  	"author" "enum_notes_author",
  	"visibility" "enum_notes_visibility" DEFAULT 'public',
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
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
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
  	"notes_id" integer
  );
  
  CREATE TABLE "_notes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__notes_v_version_type" DEFAULT 'thought',
  	"version_author" "enum__notes_v_version_author",
  	"version_visibility" "enum__notes_v_version_visibility" DEFAULT 'public',
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
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
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
  	"notes_id" integer
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"workflow_slug" "enum_payload_jobs_workflow_slug",
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"media_id" integer,
  	"topics_id" integer,
  	"projects_id" integer,
  	"lyovsons_id" integer,
  	"contacts_id" integer,
  	"references_id" integer,
  	"activities_id" integer,
  	"notes_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lyovsons_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_breadcrumbs" ADD CONSTRAINT "topics_breadcrumbs_doc_id_topics_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_breadcrumbs" ADD CONSTRAINT "topics_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons_social_links" ADD CONSTRAINT "lyovsons_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons_sessions" ADD CONSTRAINT "lyovsons_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lyovsons" ADD CONSTRAINT "lyovsons_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references_platforms" ADD CONSTRAINT "references_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_roles" ADD CONSTRAINT "references_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references_links" ADD CONSTRAINT "references_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_series_id_references_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_album_id_references_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_show_id_references_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references_texts" ADD CONSTRAINT "references_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_platforms" ADD CONSTRAINT "_references_v_version_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_roles" ADD CONSTRAINT "_references_v_version_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v_version_links" ADD CONSTRAINT "_references_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_parent_id_references_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_series_id_references_id_fk" FOREIGN KEY ("version_series_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_album_id_references_id_fk" FOREIGN KEY ("version_album_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v" ADD CONSTRAINT "_references_v_version_show_id_references_id_fk" FOREIGN KEY ("version_show_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_references_v_texts" ADD CONSTRAINT "_references_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_references_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities_reviews" ADD CONSTRAINT "activities_reviews_lyovson_id_lyovsons_id_fk" FOREIGN KEY ("lyovson_id") REFERENCES "public"."lyovsons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities_reviews" ADD CONSTRAINT "activities_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_reference_id_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities_rels" ADD CONSTRAINT "activities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities_rels" ADD CONSTRAINT "activities_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_activities_v_version_reviews" ADD CONSTRAINT "_activities_v_version_reviews_lyovson_id_lyovsons_id_fk" FOREIGN KEY ("lyovson_id") REFERENCES "public"."lyovsons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_activities_v_version_reviews" ADD CONSTRAINT "_activities_v_version_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_activities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_activities_v" ADD CONSTRAINT "_activities_v_parent_id_activities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_activities_v" ADD CONSTRAINT "_activities_v_version_reference_id_references_id_fk" FOREIGN KEY ("version_reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_activities_v_rels" ADD CONSTRAINT "_activities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_activities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_activities_v_rels" ADD CONSTRAINT "_activities_v_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes" ADD CONSTRAINT "notes_source_reference_id_references_id_fk" FOREIGN KEY ("source_reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notes_rels" ADD CONSTRAINT "notes_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_source_reference_id_references_id_fk" FOREIGN KEY ("version_source_reference_id") REFERENCES "public"."references"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_notes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notes_v_rels" ADD CONSTRAINT "_notes_v_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_topics" ADD CONSTRAINT "search_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_lyovsons_fk" FOREIGN KEY ("lyovsons_id") REFERENCES "public"."lyovsons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_project_idx" ON "posts" USING btree ("project_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_references_id_idx" ON "posts_rels" USING btree ("references_id");
  CREATE INDEX "posts_rels_topics_id_idx" ON "posts_rels" USING btree ("topics_id");
  CREATE INDEX "posts_rels_notes_id_idx" ON "posts_rels" USING btree ("notes_id");
  CREATE INDEX "posts_rels_lyovsons_id_idx" ON "posts_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_project_idx" ON "_posts_v" USING btree ("version_project_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_references_id_idx" ON "_posts_v_rels" USING btree ("references_id");
  CREATE INDEX "_posts_v_rels_topics_id_idx" ON "_posts_v_rels" USING btree ("topics_id");
  CREATE INDEX "_posts_v_rels_notes_id_idx" ON "_posts_v_rels" USING btree ("notes_id");
  CREATE INDEX "_posts_v_rels_lyovsons_id_idx" ON "_posts_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "topics_breadcrumbs_order_idx" ON "topics_breadcrumbs" USING btree ("_order");
  CREATE INDEX "topics_breadcrumbs_parent_id_idx" ON "topics_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "topics_breadcrumbs_doc_idx" ON "topics_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_parent_idx" ON "topics" USING btree ("parent_id");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_contacts_id_idx" ON "projects_rels" USING btree ("contacts_id");
  CREATE INDEX "lyovsons_social_links_order_idx" ON "lyovsons_social_links" USING btree ("_order");
  CREATE INDEX "lyovsons_social_links_parent_id_idx" ON "lyovsons_social_links" USING btree ("_parent_id");
  CREATE INDEX "lyovsons_sessions_order_idx" ON "lyovsons_sessions" USING btree ("_order");
  CREATE INDEX "lyovsons_sessions_parent_id_idx" ON "lyovsons_sessions" USING btree ("_parent_id");
  CREATE INDEX "lyovsons_avatar_idx" ON "lyovsons" USING btree ("avatar_id");
  CREATE UNIQUE INDEX "lyovsons_username_idx" ON "lyovsons" USING btree ("username");
  CREATE INDEX "lyovsons_updated_at_idx" ON "lyovsons" USING btree ("updated_at");
  CREATE INDEX "lyovsons_created_at_idx" ON "lyovsons" USING btree ("created_at");
  CREATE UNIQUE INDEX "lyovsons_email_idx" ON "lyovsons" USING btree ("email");
  CREATE UNIQUE INDEX "lyovsons_username_1_idx" ON "lyovsons" USING btree ("username");
  CREATE UNIQUE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "contacts_project_idx" ON "contacts" USING btree ("project_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "references_platforms_order_idx" ON "references_platforms" USING btree ("order");
  CREATE INDEX "references_platforms_parent_idx" ON "references_platforms" USING btree ("parent_id");
  CREATE INDEX "references_roles_order_idx" ON "references_roles" USING btree ("order");
  CREATE INDEX "references_roles_parent_idx" ON "references_roles" USING btree ("parent_id");
  CREATE INDEX "references_links_order_idx" ON "references_links" USING btree ("_order");
  CREATE INDEX "references_links_parent_id_idx" ON "references_links" USING btree ("_parent_id");
  CREATE INDEX "references_image_idx" ON "references" USING btree ("image_id");
  CREATE INDEX "references_series_idx" ON "references" USING btree ("series_id");
  CREATE INDEX "references_album_idx" ON "references" USING btree ("album_id");
  CREATE INDEX "references_show_idx" ON "references" USING btree ("show_id");
  CREATE INDEX "references_slug_idx" ON "references" USING btree ("slug");
  CREATE INDEX "references_updated_at_idx" ON "references" USING btree ("updated_at");
  CREATE INDEX "references_created_at_idx" ON "references" USING btree ("created_at");
  CREATE INDEX "references__status_idx" ON "references" USING btree ("_status");
  CREATE INDEX "references_texts_order_parent" ON "references_texts" USING btree ("order","parent_id");
  CREATE INDEX "_references_v_version_platforms_order_idx" ON "_references_v_version_platforms" USING btree ("order");
  CREATE INDEX "_references_v_version_platforms_parent_idx" ON "_references_v_version_platforms" USING btree ("parent_id");
  CREATE INDEX "_references_v_version_roles_order_idx" ON "_references_v_version_roles" USING btree ("order");
  CREATE INDEX "_references_v_version_roles_parent_idx" ON "_references_v_version_roles" USING btree ("parent_id");
  CREATE INDEX "_references_v_version_links_order_idx" ON "_references_v_version_links" USING btree ("_order");
  CREATE INDEX "_references_v_version_links_parent_id_idx" ON "_references_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_references_v_parent_idx" ON "_references_v" USING btree ("parent_id");
  CREATE INDEX "_references_v_version_version_image_idx" ON "_references_v" USING btree ("version_image_id");
  CREATE INDEX "_references_v_version_version_series_idx" ON "_references_v" USING btree ("version_series_id");
  CREATE INDEX "_references_v_version_version_album_idx" ON "_references_v" USING btree ("version_album_id");
  CREATE INDEX "_references_v_version_version_show_idx" ON "_references_v" USING btree ("version_show_id");
  CREATE INDEX "_references_v_version_version_slug_idx" ON "_references_v" USING btree ("version_slug");
  CREATE INDEX "_references_v_version_version_updated_at_idx" ON "_references_v" USING btree ("version_updated_at");
  CREATE INDEX "_references_v_version_version_created_at_idx" ON "_references_v" USING btree ("version_created_at");
  CREATE INDEX "_references_v_version_version__status_idx" ON "_references_v" USING btree ("version__status");
  CREATE INDEX "_references_v_created_at_idx" ON "_references_v" USING btree ("created_at");
  CREATE INDEX "_references_v_updated_at_idx" ON "_references_v" USING btree ("updated_at");
  CREATE INDEX "_references_v_latest_idx" ON "_references_v" USING btree ("latest");
  CREATE INDEX "_references_v_autosave_idx" ON "_references_v" USING btree ("autosave");
  CREATE INDEX "_references_v_texts_order_parent" ON "_references_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "activities_reviews_order_idx" ON "activities_reviews" USING btree ("_order");
  CREATE INDEX "activities_reviews_parent_id_idx" ON "activities_reviews" USING btree ("_parent_id");
  CREATE INDEX "activities_reviews_lyovson_idx" ON "activities_reviews" USING btree ("lyovson_id");
  CREATE INDEX "activities_reference_idx" ON "activities" USING btree ("reference_id");
  CREATE INDEX "activities_slug_idx" ON "activities" USING btree ("slug");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "activities__status_idx" ON "activities" USING btree ("_status");
  CREATE INDEX "activities_rels_order_idx" ON "activities_rels" USING btree ("order");
  CREATE INDEX "activities_rels_parent_idx" ON "activities_rels" USING btree ("parent_id");
  CREATE INDEX "activities_rels_path_idx" ON "activities_rels" USING btree ("path");
  CREATE INDEX "activities_rels_lyovsons_id_idx" ON "activities_rels" USING btree ("lyovsons_id");
  CREATE INDEX "_activities_v_version_reviews_order_idx" ON "_activities_v_version_reviews" USING btree ("_order");
  CREATE INDEX "_activities_v_version_reviews_parent_id_idx" ON "_activities_v_version_reviews" USING btree ("_parent_id");
  CREATE INDEX "_activities_v_version_reviews_lyovson_idx" ON "_activities_v_version_reviews" USING btree ("lyovson_id");
  CREATE INDEX "_activities_v_parent_idx" ON "_activities_v" USING btree ("parent_id");
  CREATE INDEX "_activities_v_version_version_reference_idx" ON "_activities_v" USING btree ("version_reference_id");
  CREATE INDEX "_activities_v_version_version_slug_idx" ON "_activities_v" USING btree ("version_slug");
  CREATE INDEX "_activities_v_version_version_updated_at_idx" ON "_activities_v" USING btree ("version_updated_at");
  CREATE INDEX "_activities_v_version_version_created_at_idx" ON "_activities_v" USING btree ("version_created_at");
  CREATE INDEX "_activities_v_version_version__status_idx" ON "_activities_v" USING btree ("version__status");
  CREATE INDEX "_activities_v_created_at_idx" ON "_activities_v" USING btree ("created_at");
  CREATE INDEX "_activities_v_updated_at_idx" ON "_activities_v" USING btree ("updated_at");
  CREATE INDEX "_activities_v_latest_idx" ON "_activities_v" USING btree ("latest");
  CREATE INDEX "_activities_v_autosave_idx" ON "_activities_v" USING btree ("autosave");
  CREATE INDEX "_activities_v_rels_order_idx" ON "_activities_v_rels" USING btree ("order");
  CREATE INDEX "_activities_v_rels_parent_idx" ON "_activities_v_rels" USING btree ("parent_id");
  CREATE INDEX "_activities_v_rels_path_idx" ON "_activities_v_rels" USING btree ("path");
  CREATE INDEX "_activities_v_rels_lyovsons_id_idx" ON "_activities_v_rels" USING btree ("lyovsons_id");
  CREATE INDEX "notes_source_reference_idx" ON "notes" USING btree ("source_reference_id");
  CREATE INDEX "notes_slug_idx" ON "notes" USING btree ("slug");
  CREATE INDEX "notes_updated_at_idx" ON "notes" USING btree ("updated_at");
  CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");
  CREATE INDEX "notes__status_idx" ON "notes" USING btree ("_status");
  CREATE INDEX "notes_rels_order_idx" ON "notes_rels" USING btree ("order");
  CREATE INDEX "notes_rels_parent_idx" ON "notes_rels" USING btree ("parent_id");
  CREATE INDEX "notes_rels_path_idx" ON "notes_rels" USING btree ("path");
  CREATE INDEX "notes_rels_topics_id_idx" ON "notes_rels" USING btree ("topics_id");
  CREATE INDEX "notes_rels_posts_id_idx" ON "notes_rels" USING btree ("posts_id");
  CREATE INDEX "notes_rels_references_id_idx" ON "notes_rels" USING btree ("references_id");
  CREATE INDEX "notes_rels_notes_id_idx" ON "notes_rels" USING btree ("notes_id");
  CREATE INDEX "_notes_v_parent_idx" ON "_notes_v" USING btree ("parent_id");
  CREATE INDEX "_notes_v_version_version_source_reference_idx" ON "_notes_v" USING btree ("version_source_reference_id");
  CREATE INDEX "_notes_v_version_version_slug_idx" ON "_notes_v" USING btree ("version_slug");
  CREATE INDEX "_notes_v_version_version_updated_at_idx" ON "_notes_v" USING btree ("version_updated_at");
  CREATE INDEX "_notes_v_version_version_created_at_idx" ON "_notes_v" USING btree ("version_created_at");
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
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_topics_order_idx" ON "search_topics" USING btree ("_order");
  CREATE INDEX "search_topics_parent_id_idx" ON "search_topics" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_description_idx" ON "search" USING btree ("description");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_workflow_slug_idx" ON "payload_jobs" USING btree ("workflow_slug");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_lyovsons_id_idx" ON "payload_locked_documents_rels" USING btree ("lyovsons_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_references_id_idx" ON "payload_locked_documents_rels" USING btree ("references_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("notes_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_lyovsons_id_idx" ON "payload_preferences_rels" USING btree ("lyovsons_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "topics_breadcrumbs" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "lyovsons_social_links" CASCADE;
  DROP TABLE "lyovsons_sessions" CASCADE;
  DROP TABLE "lyovsons" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "references_platforms" CASCADE;
  DROP TABLE "references_roles" CASCADE;
  DROP TABLE "references_links" CASCADE;
  DROP TABLE "references" CASCADE;
  DROP TABLE "references_texts" CASCADE;
  DROP TABLE "_references_v_version_platforms" CASCADE;
  DROP TABLE "_references_v_version_roles" CASCADE;
  DROP TABLE "_references_v_version_links" CASCADE;
  DROP TABLE "_references_v" CASCADE;
  DROP TABLE "_references_v_texts" CASCADE;
  DROP TABLE "activities_reviews" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "activities_rels" CASCADE;
  DROP TABLE "_activities_v_version_reviews" CASCADE;
  DROP TABLE "_activities_v" CASCADE;
  DROP TABLE "_activities_v_rels" CASCADE;
  DROP TABLE "notes" CASCADE;
  DROP TABLE "notes_rels" CASCADE;
  DROP TABLE "_notes_v" CASCADE;
  DROP TABLE "_notes_v_rels" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_topics" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_posts_type";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_type";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_lyovsons_social_links_platform";
  DROP TYPE "public"."enum_lyovsons_font";
  DROP TYPE "public"."enum_contacts_status";
  DROP TYPE "public"."enum_references_platforms";
  DROP TYPE "public"."enum_references_roles";
  DROP TYPE "public"."enum_references_links_kind";
  DROP TYPE "public"."enum_references_type";
  DROP TYPE "public"."enum_references_format";
  DROP TYPE "public"."enum_references_mpaa_rating";
  DROP TYPE "public"."enum_references_status";
  DROP TYPE "public"."enum_references_esrb_rating";
  DROP TYPE "public"."enum__references_v_version_platforms";
  DROP TYPE "public"."enum__references_v_version_roles";
  DROP TYPE "public"."enum__references_v_version_links_kind";
  DROP TYPE "public"."enum__references_v_version_type";
  DROP TYPE "public"."enum__references_v_version_format";
  DROP TYPE "public"."enum__references_v_version_mpaa_rating";
  DROP TYPE "public"."enum__references_v_version_status";
  DROP TYPE "public"."enum__references_v_version_esrb_rating";
  DROP TYPE "public"."enum_activities_activity_type";
  DROP TYPE "public"."enum_activities_visibility";
  DROP TYPE "public"."enum_activities_status";
  DROP TYPE "public"."enum__activities_v_version_activity_type";
  DROP TYPE "public"."enum__activities_v_version_visibility";
  DROP TYPE "public"."enum__activities_v_version_status";
  DROP TYPE "public"."enum_notes_type";
  DROP TYPE "public"."enum_notes_author";
  DROP TYPE "public"."enum_notes_visibility";
  DROP TYPE "public"."enum_notes_status";
  DROP TYPE "public"."enum__notes_v_version_type";
  DROP TYPE "public"."enum__notes_v_version_author";
  DROP TYPE "public"."enum__notes_v_version_visibility";
  DROP TYPE "public"."enum__notes_v_version_status";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_workflow_slug";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`);
}
