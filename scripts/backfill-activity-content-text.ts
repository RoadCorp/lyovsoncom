/**
 * Recompute activities.content_text (and, through the generated column,
 * search_vector) with the current populateContentText hook.
 *
 * Dry run:  pnpm payload run scripts/backfill-activity-content-text.ts
 * Write:    BACKFILL_WRITE=1 pnpm payload run scripts/backfill-activity-content-text.ts
 *
 * Writes go straight through the database adapter, so no collection hooks,
 * versions, embedding stale markers or cache invalidation run.
 */
import configPromise from "@payload-config";
import { createLocalReq, getPayload } from "payload";
import { populateContentTextHook } from "@/collections/Activities/hooks/populate-content-text";

const write = process.env.BACKFILL_WRITE === "1";
const payload = await getPayload({ config: await configPromise });
const req = await createLocalReq({}, payload);

const { docs } = await payload.find({
  collection: "activities",
  depth: 0,
  overrideAccess: true,
  pagination: false,
  select: {
    activityType: true,
    content_text: true,
    notes: true,
    reference: true,
    updatedAt: true,
  },
});

let changed = 0;

for (const doc of docs) {
  const next = await populateContentTextHook({
    collection: payload.collections.activities.config,
    context: {},
    data: { ...doc },
    operation: "update",
    originalDoc: doc,
    req,
  });
  const contentText = (next?.content_text as string | null) ?? null;

  if (contentText === (doc.content_text ?? null)) {
    continue;
  }

  changed += 1;
  payload.logger.info({
    msg: write
      ? "activity.content_text.updated"
      : "activity.content_text.dry_run",
    id: doc.id,
    before: doc.content_text?.slice(0, 60) ?? null,
    after: contentText?.slice(0, 60) ?? null,
  });

  if (write) {
    await payload.db.updateOne({
      collection: "activities",
      id: doc.id,
      // Keep updatedAt so sitemap and JSON-LD dates don't change.
      data: { content_text: contentText, updatedAt: doc.updatedAt },
      req,
    });
  }
}

payload.logger.info({
  msg: "activity.content_text.backfill",
  mode: write ? "write" : "dry-run",
  total: docs.length,
  changed,
});
process.exit(0);
