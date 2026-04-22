import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_references_course_platform') THEN
      CREATE TYPE "public"."enum_references_course_platform" AS ENUM('udemy', 'coursera', 'frontendMasters', 'masterclass', 'pluralsight', 'edx', 'skillshare', 'linkedinLearning', 'egghead', 'youtube', 'other');
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_references_course_level') THEN
      CREATE TYPE "public"."enum_references_course_level" AS ENUM('beginner', 'intermediate', 'advanced');
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__references_v_version_course_platform') THEN
      CREATE TYPE "public"."enum__references_v_version_course_platform" AS ENUM('udemy', 'coursera', 'frontendMasters', 'masterclass', 'pluralsight', 'edx', 'skillshare', 'linkedinLearning', 'egghead', 'youtube', 'other');
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__references_v_version_course_level') THEN
      CREATE TYPE "public"."enum__references_v_version_course_level" AS ENUM('beginner', 'intermediate', 'advanced');
    END IF;
  END $$;
  ALTER TYPE "public"."enum_references_type" ADD VALUE IF NOT EXISTS 'course' BEFORE 'match';
  ALTER TYPE "public"."enum__references_v_version_type" ADD VALUE IF NOT EXISTS 'course' BEFORE 'match';
  ALTER TYPE "public"."enum_activities_activity_type" ADD VALUE IF NOT EXISTS 'learn';
  ALTER TYPE "public"."enum__activities_v_version_activity_type" ADD VALUE IF NOT EXISTS 'learn';
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_seo_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_seo_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_seo_image_id" integer;
  ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
  ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  ALTER TABLE "references" ADD COLUMN IF NOT EXISTS "instructor" varchar;
  ALTER TABLE "references" ADD COLUMN IF NOT EXISTS "course_platform" "enum_references_course_platform";
  ALTER TABLE "references" ADD COLUMN IF NOT EXISTS "course_duration" varchar;
  ALTER TABLE "references" ADD COLUMN IF NOT EXISTS "course_level" "enum_references_course_level";
  ALTER TABLE "references" ADD COLUMN IF NOT EXISTS "course_url" varchar;
  ALTER TABLE "_references_v" ADD COLUMN IF NOT EXISTS "version_instructor" varchar;
  ALTER TABLE "_references_v" ADD COLUMN IF NOT EXISTS "version_course_platform" "enum__references_v_version_course_platform";
  ALTER TABLE "_references_v" ADD COLUMN IF NOT EXISTS "version_course_duration" varchar;
  ALTER TABLE "_references_v" ADD COLUMN IF NOT EXISTS "version_course_level" "enum__references_v_version_course_level";
  ALTER TABLE "_references_v" ADD COLUMN IF NOT EXISTS "version_course_url" varchar;
  ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
  ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  ALTER TABLE "_activities_v" ADD COLUMN IF NOT EXISTS "version_seo_title" varchar;
  ALTER TABLE "_activities_v" ADD COLUMN IF NOT EXISTS "version_seo_description" varchar;
  ALTER TABLE "_activities_v" ADD COLUMN IF NOT EXISTS "version_seo_image_id" integer;
  ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
  ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  ALTER TABLE "_notes_v" ADD COLUMN IF NOT EXISTS "version_seo_title" varchar;
  ALTER TABLE "_notes_v" ADD COLUMN IF NOT EXISTS "version_seo_description" varchar;
  ALTER TABLE "_notes_v" ADD COLUMN IF NOT EXISTS "version_seo_image_id" integer;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_seo_image_id_media_id_fk') THEN
      ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_posts_v_version_seo_image_id_media_id_fk') THEN
      ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'topics_seo_image_id_media_id_fk') THEN
      ALTER TABLE "topics" ADD CONSTRAINT "topics_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_seo_image_id_media_id_fk') THEN
      ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activities_seo_image_id_media_id_fk') THEN
      ALTER TABLE "activities" ADD CONSTRAINT "activities_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_activities_v_version_seo_image_id_media_id_fk') THEN
      ALTER TABLE "_activities_v" ADD CONSTRAINT "_activities_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_seo_image_id_media_id_fk') THEN
      ALTER TABLE "notes" ADD CONSTRAINT "notes_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_notes_v_version_seo_image_id_media_id_fk') THEN
      ALTER TABLE "_notes_v" ADD CONSTRAINT "_notes_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX IF NOT EXISTS "topics_seo_seo_image_idx" ON "topics" USING btree ("seo_image_id");
  CREATE INDEX IF NOT EXISTS "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE INDEX IF NOT EXISTS "activities_seo_seo_image_idx" ON "activities" USING btree ("seo_image_id");
  CREATE INDEX IF NOT EXISTS "_activities_v_version_seo_version_seo_image_idx" ON "_activities_v" USING btree ("version_seo_image_id");
  CREATE INDEX IF NOT EXISTS "notes_seo_seo_image_idx" ON "notes" USING btree ("seo_image_id");
  CREATE INDEX IF NOT EXISTS "_notes_v_version_seo_version_seo_image_idx" ON "_notes_v" USING btree ("version_seo_image_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT "posts_seo_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "topics" DROP CONSTRAINT "topics_seo_image_id_media_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_seo_image_id_media_id_fk";
  
  ALTER TABLE "activities" DROP CONSTRAINT "activities_seo_image_id_media_id_fk";
  
  ALTER TABLE "_activities_v" DROP CONSTRAINT "_activities_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "notes" DROP CONSTRAINT "notes_seo_image_id_media_id_fk";
  
  ALTER TABLE "_notes_v" DROP CONSTRAINT "_notes_v_version_seo_image_id_media_id_fk";
  
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_references_type";
  CREATE TYPE "public"."enum_references_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'match', 'other');
  ALTER TABLE "references" ALTER COLUMN "type" SET DATA TYPE "public"."enum_references_type" USING "type"::"public"."enum_references_type";
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__references_v_version_type";
  CREATE TYPE "public"."enum__references_v_version_type" AS ENUM('book', 'movie', 'tvShow', 'videoGame', 'music', 'podcast', 'series', 'person', 'company', 'website', 'article', 'video', 'repository', 'tool', 'social', 'match', 'other');
  ALTER TABLE "_references_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__references_v_version_type" USING "version_type"::"public"."enum__references_v_version_type";
  ALTER TABLE "activities" ALTER COLUMN "activity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_activities_activity_type";
  CREATE TYPE "public"."enum_activities_activity_type" AS ENUM('read', 'watch', 'listen', 'play', 'visit');
  ALTER TABLE "activities" ALTER COLUMN "activity_type" SET DATA TYPE "public"."enum_activities_activity_type" USING "activity_type"::"public"."enum_activities_activity_type";
  ALTER TABLE "_activities_v" ALTER COLUMN "version_activity_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__activities_v_version_activity_type";
  CREATE TYPE "public"."enum__activities_v_version_activity_type" AS ENUM('read', 'watch', 'listen', 'play', 'visit');
  ALTER TABLE "_activities_v" ALTER COLUMN "version_activity_type" SET DATA TYPE "public"."enum__activities_v_version_activity_type" USING "version_activity_type"::"public"."enum__activities_v_version_activity_type";
  DROP INDEX "posts_seo_seo_image_idx";
  DROP INDEX "_posts_v_version_seo_version_seo_image_idx";
  DROP INDEX "topics_seo_seo_image_idx";
  DROP INDEX "projects_seo_seo_image_idx";
  DROP INDEX "activities_seo_seo_image_idx";
  DROP INDEX "_activities_v_version_seo_version_seo_image_idx";
  DROP INDEX "notes_seo_seo_image_idx";
  DROP INDEX "_notes_v_version_seo_version_seo_image_idx";
  ALTER TABLE "posts" DROP COLUMN "seo_title";
  ALTER TABLE "posts" DROP COLUMN "seo_description";
  ALTER TABLE "posts" DROP COLUMN "seo_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "topics" DROP COLUMN "seo_title";
  ALTER TABLE "topics" DROP COLUMN "seo_description";
  ALTER TABLE "topics" DROP COLUMN "seo_image_id";
  ALTER TABLE "projects" DROP COLUMN "seo_title";
  ALTER TABLE "projects" DROP COLUMN "seo_description";
  ALTER TABLE "projects" DROP COLUMN "seo_image_id";
  ALTER TABLE "references" DROP COLUMN "instructor";
  ALTER TABLE "references" DROP COLUMN "course_platform";
  ALTER TABLE "references" DROP COLUMN "course_duration";
  ALTER TABLE "references" DROP COLUMN "course_level";
  ALTER TABLE "references" DROP COLUMN "course_url";
  ALTER TABLE "_references_v" DROP COLUMN "version_instructor";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_platform";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_duration";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_level";
  ALTER TABLE "_references_v" DROP COLUMN "version_course_url";
  ALTER TABLE "activities" DROP COLUMN "seo_title";
  ALTER TABLE "activities" DROP COLUMN "seo_description";
  ALTER TABLE "activities" DROP COLUMN "seo_image_id";
  ALTER TABLE "_activities_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_activities_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_activities_v" DROP COLUMN "version_seo_image_id";
  ALTER TABLE "notes" DROP COLUMN "seo_title";
  ALTER TABLE "notes" DROP COLUMN "seo_description";
  ALTER TABLE "notes" DROP COLUMN "seo_image_id";
  ALTER TABLE "_notes_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_notes_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_notes_v" DROP COLUMN "version_seo_image_id";
  DROP TYPE "public"."enum_references_course_platform";
  DROP TYPE "public"."enum_references_course_level";
  DROP TYPE "public"."enum__references_v_version_course_platform";
  DROP TYPE "public"."enum__references_v_version_course_level";`);
}
