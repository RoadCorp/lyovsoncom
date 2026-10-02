import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Payload 3.90 adds the storage object key on uploads and the reset-password
// request timestamp on auth collections.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "lyovsons" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey";
  ALTER TABLE "lyovsons" DROP COLUMN IF EXISTS "reset_password_requested_at";`);
}
