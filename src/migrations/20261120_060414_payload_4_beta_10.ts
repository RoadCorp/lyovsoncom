import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "@payloadcms/db-vercel-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "_stored" boolean;
  ALTER TABLE "media" ADD COLUMN "_transforms" jsonb;
  ALTER TABLE "media" ADD COLUMN "original__stored" boolean;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail__stored" boolean;
  ALTER TABLE "_media_v" ADD COLUMN "version__stored" boolean;
  ALTER TABLE "_media_v" ADD COLUMN "version__transforms" jsonb;
  ALTER TABLE "_media_v" ADD COLUMN "version_original__stored" boolean;
  ALTER TABLE "_media_v" ADD COLUMN "version_variants_thumbnail__stored" boolean;
  ALTER TABLE "lyovsons_sessions" ADD COLUMN "refresh_count" numeric;
  ALTER TABLE "lyovsons_sessions" ADD COLUMN "refreshed_at" timestamp(3) with time zone;
  ALTER TABLE "lyovsons_sessions" ADD COLUMN "label" varchar;
  ALTER TABLE "lyovsons_sessions" ADD COLUMN "type" varchar;
  ALTER TABLE "lyovsons_sessions" ADD COLUMN "metadata" jsonb;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "_stored";
  ALTER TABLE "media" DROP COLUMN "_transforms";
  ALTER TABLE "media" DROP COLUMN "original__stored";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail__stored";
  ALTER TABLE "_media_v" DROP COLUMN "version__stored";
  ALTER TABLE "_media_v" DROP COLUMN "version__transforms";
  ALTER TABLE "_media_v" DROP COLUMN "version_original__stored";
  ALTER TABLE "_media_v" DROP COLUMN "version_variants_thumbnail__stored";
  ALTER TABLE "lyovsons_sessions" DROP COLUMN "refresh_count";
  ALTER TABLE "lyovsons_sessions" DROP COLUMN "refreshed_at";
  ALTER TABLE "lyovsons_sessions" DROP COLUMN "label";
  ALTER TABLE "lyovsons_sessions" DROP COLUMN "type";
  ALTER TABLE "lyovsons_sessions" DROP COLUMN "metadata";`);
}
