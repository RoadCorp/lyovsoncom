/**
 * Replace Tenor GIFs in GIF blocks with their GIPHY equivalents, hotlinked
 * the same way as GIFs picked in the CMS. Tenor's API is shut down and its
 * media host will follow.
 *
 * Dry run:  pnpm payload run scripts/replace-tenor-gifs.ts
 * Write:    BACKFILL_WRITE=1 pnpm payload run scripts/replace-tenor-gifs.ts
 *
 * Idempotent: only blocks whose mp4Url is still on media.tenor.com change.
 * Clips GIPHY doesn't have are uploaded to Media from Tenor instead (reused
 * by filename on a rerun). Any other Tenor GIF is reported and left alone.
 * Saves skip embeddings (captions don't change) and cache invalidation,
 * which needs Next; post pages refresh within their 48-hour cache life,
 * or on the next publish.
 */
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { formatAspectRatio, giphyMediaUrls } from "@/blocks/GIF/giphy";

// Tenor media id (the first 11 characters of the path) → GIPHY id and alt
// text, each checked by eye against the Tenor still: the same clip or scene.
const GIPHY_MATCHES: Record<string, { alt: string; id: string }> = {
  "04KdcsfRodU": {
    id: "l0IykOsxLECVejOzm",
    alt: "Charlie Day ranting in front of a conspiracy board",
  },
  "c9A7w-0nmKc": { id: "smGpsxCQzXwDS", alt: "A glowing neon Apple logo" },
  "fw-0U7YQBzs": { id: "j8HJv9BX0chYQ", alt: "Popeye knocked down on the mat" },
  TyEfGon6ieI: { id: "0uPdvqdl0wCH6NrbDV", alt: "Ruby by the car in CODA" },
  UGwP2mDCcqM: {
    id: "U6Qzze3Mt90Ig",
    alt: 'Mad-Eye Moody shouting "Constant vigilance!"',
  },
  ZpWIgnTC1dQ: {
    id: "Trh2LxGxp0CsM",
    alt: 'Shia LaBeouf shouting "Just do it!"',
  },
  // Not the same clips: GIPHY has no copies, so these are close stand-ins.
  nNO1EEhe0WA: { id: "i9moECwUvEKre", alt: "Sheldon awkwardly consoling Amy" },
  hEIyWrrZfxo: {
    id: "vc0dTWhvhmFq2tg3JV",
    alt: "The white rabbit from The Matrix in a green mirror",
  },
};

// Tenor media id → Tenor clips that GIPHY doesn't have, uploaded to Media.
// Aspect ratios were measured from the Tenor files.
const TENOR_UPLOADS: Record<string, { alt: string; aspectRatio: string }> = {
  WWvs39QlsEQ: {
    alt: "Marques Brownlee putting on an Apple Vision Pro, his eyes showing on the front",
    aspectRatio: "1",
  },
  "e7UXmP-vkXk": { alt: 'Loki saying "A bit of both"', aspectRatio: "1.7978" },
  HMiDdVJ9e24: {
    alt: "Harry's arm left boneless after Lockhart's spell",
    aspectRatio: "2.4038",
  },
  BQnAHKfBWXw: {
    alt: "Apple's Liquid Glass interface intro",
    aspectRatio: "1.766",
  },
};

const TENOR_HOST = "media.tenor.com";
const write = process.env.BACKFILL_WRITE === "1";
const payload = await getPayload({ config: await configPromise });

type Node = Record<string, unknown>;
interface GifFields {
  alt?: string | null;
  aspectRatio?: string | null;
  blockType?: string;
  embedCode?: unknown;
  media?: number | null;
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
async function giphyFields({ alt, id }: { alt: string; id: string }) {
  const urls = giphyMediaUrls(id);
  const [still, video] = await Promise.all([
    fetch(urls.posterUrl),
    fetch(urls.mp4Url, { method: "HEAD" }),
  ]);
  if (!(still.ok && video.ok)) {
    throw new Error(`GIPHY ${id}: still ${still.status}, mp4 ${video.status}`);
  }
  // A GIF header stores the logical screen width and height at bytes 6–9.
  const header = new DataView(await still.arrayBuffer());
  const width = header.getUint16(6, true);
  const height = header.getUint16(8, true);

  return {
    ...urls,
    alt,
    aspectRatio: formatAspectRatio(width, height),
    webmUrl: null,
  };
}

/** Uploads a Tenor clip to Media once; returns the Media id (none in a dry run). */
async function uploadTenor(url: string, id: string, alt: string) {
  const filename = `tenor-${id}.mp4`;
  const { docs } = await payload.find({
    collection: "media",
    // Payload 4 stores it as tenor-<id>-original.mp4.
    where: { filename: { like: `tenor-${id}` } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (docs[0] || !write) {
    return docs[0]?.id ?? null;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tenor ${id}: ${response.status}`);
  }
  const data = Buffer.from(await response.arrayBuffer());
  const media = await payload.create({
    collection: "media",
    data: { alt },
    file: { data, mimetype: "video/mp4", name: filename, size: data.length },
    context: { skipRevalidation: true },
    overrideAccess: true,
  });
  return media.id;
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
    const upload = TENOR_UPLOADS[id];
    if (upload) {
      const media = await uploadTenor(fields.mp4Url, id, upload.alt);
      payload.logger.info({
        msg: write ? "gif.uploaded" : "gif.dry_run_upload",
        where,
        tenor: fields.mp4Url,
        media,
      });
      Object.assign(fields, {
        ...upload,
        media,
        mp4Url: null,
        posterUrl: null,
        sourceUrl: null,
        webmUrl: null,
      });
      fields.embedCode = undefined;
      return 1;
    }
    const match = GIPHY_MATCHES[id];
    if (!match) {
      payload.logger.warn({ msg: "gif.no_match", where, tenor: fields.mp4Url });
      return 0;
    }
    const next = await giphyFields(match);
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
