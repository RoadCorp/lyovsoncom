// Crawl every sitemap URL (plus a few stress pages) and save a normalized
// snapshot: status, title, canonical, description, og:image, headings,
// internal links, image alts and JSON-LD. Compare two snapshots with --diff.
//
//   node crawl-snapshot.mjs <base-url> <out.json>
//   node crawl-snapshot.mjs --diff <before.json> <after.json>
import fs from "node:fs";

const UA =
  "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140 Safari/537.36";
const EXTRA_PATHS = [
  "/",
  "/search?q=vercel",
  "/posts/audit-stress-long-title-no-image",
  "/notes/audit-stress-long-note",
];
const COMPARED = [
  "status",
  "title",
  "canonical",
  "desc",
  "og",
  "headings",
  "imgs",
  "ld",
];

async function snapshot(base, out) {
  const sitemap = await (
    await fetch(`${base}/sitemap.xml`, { headers: { "user-agent": UA } })
  ).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname
  );
  const pages = {};
  for (const path of new Set([...paths, ...EXTRA_PATHS])) {
    const response = await fetch(base + path, {
      headers: { "user-agent": UA },
    });
    const html = await response.text();
    const all = (re) => [...html.matchAll(re)].map((m) => m[1]);
    pages[path] = {
      status: response.status,
      title: all(/<title>([^<]*)/g)[0],
      canonical: all(/<link rel="canonical" href="([^"]+)"/g)[0],
      desc: all(/<meta name="description" content="([^"]*)"/g)[0],
      og: all(/<meta property="og:image" content="([^"]*)"/g)[0],
      headings: all(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g).map((x) =>
        x.replace(/<[^>]+>/g, "").trim()
      ),
      links: [...new Set(all(/href="(\/[^"#?]*)"/g))]
        .filter((l) => !l.startsWith("/_next"))
        .sort(),
      imgs: [...new Set(all(/<img [^>]*alt="([^"]*)"/g))].sort(),
      ld: all(
        /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
      ).map((j) => JSON.parse(j)),
    };
  }
  fs.writeFileSync(out, JSON.stringify(pages, null, 1));
  console.log(`pages: ${Object.keys(pages).length}`);
}

function diff(beforeFile, afterFile) {
  const before = JSON.parse(fs.readFileSync(beforeFile, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterFile, "utf8"));
  const onlyOne = Object.keys(before)
    .filter((p) => !(p in after))
    .concat(Object.keys(after).filter((p) => !(p in before)));
  const changes = [];
  for (const path of Object.keys(before).filter((p) => p in after)) {
    for (const key of [...COMPARED, "links"]) {
      if (
        JSON.stringify(before[path][key]) !== JSON.stringify(after[path][key])
      ) {
        changes.push(`${path}: ${key}`);
      }
    }
  }
  console.log(
    `pages: ${Object.keys(before).length} -> ${Object.keys(after).length}`
  );
  console.log(
    onlyOne.length
      ? `only in one snapshot: ${onlyOne.join(", ")}`
      : "same page set"
  );
  console.log(changes.length ? changes.join("\n") : "no differences");
  process.exitCode = changes.length || onlyOne.length ? 1 : 0;
}

const [mode, a, b] = process.argv.slice(2);
if (mode === "--diff") {
  diff(a, b);
} else {
  await snapshot(mode, a);
}
