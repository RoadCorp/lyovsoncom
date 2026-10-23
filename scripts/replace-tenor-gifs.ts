/**
 * Replace Tenor GIFs in GIF blocks with their GIPHY equivalents, hotlinked
 * the same way as GIFs picked in the CMS. Tenor's API is shut down and its
 * media host will follow.
 *
 * Dry run:  pnpm payload run scripts/replace-tenor-gifs.ts
 * Write:    BACKFILL_WRITE=1 pnpm payload run scripts/replace-tenor-gifs.ts
 *
 * Idempotent: only blocks whose mp4Url is still on media.tenor.com change.
 * A Tenor GIF without a GIPHY match below is reported and left alone.
 * Saves skip embeddings (captions don't change) and cache invalidation,
 * which needs Next; post pages refresh within their 48-hour cache life,
 * or on the next publish.
 */
import configPromise from "@payload-config";
import { getPayload } from "payload";

// Tenor media id (the first 11 characters of the path) → GIPHY id, each
// checked by eye against the Tenor still: the same clip or the same scene.
const GIPHY_IDS: Record<string, string> = {
  "04KdcsfRodU": "l0IykOsxLECVejOzm", // Charlie Day's conspiracy board
  "c9A7w-0nmKc": "smGpsxCQzXwDS", // neon Apple logo
  "fw-0U7YQBzs": "j8HJv9BX0chYQ", // Popeye down on the mat
  TyEfGon6ieI: "0uPdvqdl0wCH6NrbDV", // CODA, Ruby at the car
  UGwP2mDCcqM: "U6Qzze3Mt90Ig", // Moody, "Constant vigilance!"
  ZpWIgnTC1dQ: "Trh2LxGxp0CsM", // Shia LaBeouf, "Just do it!"
};

const TENOR_HOST = "media.tenor.com";
const write = process.env.BACKFILL_WRITE === "1";
const payload = await getPayload({ config: await configPromise });

type Node = Record<string, unknown>;
interface GifFields {
  aspectRatio?: string | null;
  blockType?: string;
  embedCode?: unknown;
  mp4Url?: string | null;
  posterUrl?: string | null;
  sourceUrl?: string | null;
  webmUrl?: string | null;
}

function tenorId(url: string): string | null {
  const parsed = URL.parse(url);
  if (parsed?.hostname !== TENOR_HOST) {
    return null;
  }
  return parsed.pathname.split("/")[1]?.slice(0, 11) ?? null;
}

/** GIPHY renditions for an id, after checking that both files exist. */
async function giphyFields(id: string) {
  const base = `https://media.giphy.com/media/${id}`;
  const [still, video] = await Promise.all([
    fetch(`${base}/giphy_s.gif`),
    fetch(`${base}/giphy.mp4`, { method: "HEAD" }),
  ]);
  if (!(still.ok && video.ok)) {
    throw new Error(`GIPHY ${id}: still ${still.status}, mp4 ${video.status}`);
  }
  // A GIF header stores the logical screen width and height at bytes 6–9.
  const header = new DataView(await still.arrayBuffer());
  const width = header.getUint16(6, true);
  const height = header.getUint16(8, true);

  return {
    aspectRatio: String(Number((width / height).toFixed(4))),
    mp4Url: `${base}/giphy.mp4`,
    posterUrl: `${base}/giphy_s.gif`,
    sourceUrl: `https://giphy.com/gifs/${id}`,
    webmUrl: null,
  };
}

/** Repoints Tenor GIF blocks in place; returns how many changed. */
async function replaceIn(value: unknown, where: string): Promise<number> {
  if (Array.isArray(value)) {
    let changed = 0;
    for (const item of value) {
      changed += await replaceIn(item, where);
    }
    return changed;
  }
  if (!(value && typeof value === "object")) {
    return 0;
  }

  const node = value as Node;
  const fields = node.fields as GifFields | undefined;
  if (node.type === "block" && fields?.blockType === "gif" && fields.mp4Url) {
    const id = tenorId(fields.mp4Url);
    if (!id) {
      return 0;
    }
    const giphyId = GIPHY_IDS[id];
    if (!giphyId) {
      payload.logger.warn({ msg: "gif.no_match", where, tenor: fields.mp4Url });
      return 0;
    }
    const next = await giphyFields(giphyId);
    payload.logger.info({
      msg: write ? "gif.replaced" : "gif.dry_run",
      where,
      tenor: fields.mp4Url,
      giphy: next.sourceUrl,
      aspectRatio: `${fields.aspectRatio} → ${next.aspectRatio}`,
    });
    Object.assign(fields, next);
    // Leftover from the old Tenor embed; not in the block schema.
    fields.embedCode = undefined;
    return 1;
  }

  let changed = 0;
  for (const child of Object.values(node)) {
    changed += await replaceIn(child, where);
  }
  return changed;
}

// Collections whose editor includes the GIF block.
const collections = ["posts", "projects", "activities"] as const;
let total = 0;

for (const collection of collections) {
  const { docs } = await payload.find({
    collection,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  });

  for (const doc of docs) {
    if (!JSON.stringify(doc).includes(TENOR_HOST)) {
      continue;
    }
    const original = doc as unknown as Node;
    const data = structuredClone(original);
    const changed = await replaceIn(data, `${collection}/${doc.id}`);
    if (!changed) {
      continue;
    }
    total += changed;

    if (write) {
      const changedFields = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            JSON.stringify(value) !== JSON.stringify(original[key])
        )
      );
      await payload.update({
        collection,
        id: doc.id,
        data: changedFields,
        context: { skipEmbeddingGeneration: true, skipRevalidation: true },
        overrideAccess: true,
      });
    }
  }
}

payload.logger.info({
  msg: "gif.tenor_to_giphy",
  mode: write ? "write" : "dry-run",
  replaced: total,
});
process.exit(0);
