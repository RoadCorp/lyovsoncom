import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/db-vercel-postgres";
import { migrateSizesToVariants } from "@payloadcms/db-vercel-postgres/migration-utils";

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await migrateSizesToVariants({ db, payload });
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await migrateSizesToVariants({ db, direction: "down", payload });
}
