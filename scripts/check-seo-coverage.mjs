import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const requiredMetadataDirectories = ["src/app/(frontend)", "src/app/(payload)"];

const requiredCanonicalFiles = [
  "src/app/(frontend)/posts/page.tsx",
  "src/app/(frontend)/notes/page.tsx",
  "src/app/(frontend)/activities/page.tsx",
  "src/app/(frontend)/projects/page.tsx",
  "src/app/(frontend)/search/page.tsx",
  "src/app/(frontend)/posts/[slug]/page.tsx",
  "src/app/(frontend)/notes/[slug]/page.tsx",
  "src/app/(frontend)/activities/[date]/[slug]/page.tsx",
  "src/app/(frontend)/projects/[project]/page.tsx",
  "src/app/(frontend)/topics/[slug]/page.tsx",
  "src/app/(frontend)/[lyovson]/page.tsx",
  "src/app/(frontend)/[lyovson]/posts/page.tsx",
  "src/app/(frontend)/[lyovson]/notes/page.tsx",
  "src/app/(frontend)/[lyovson]/activities/page.tsx",
  "src/app/(frontend)/[lyovson]/portfolio/page.tsx",
  "src/app/(frontend)/[lyovson]/bio/page.tsx",
  "src/app/(frontend)/[lyovson]/contact/page.tsx",
  "src/app/(frontend)/[lyovson]/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/[lyovson]/posts/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/[lyovson]/notes/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/[lyovson]/activities/page/[pageNumber]/page.tsx",
];

const requiredJsonLdFiles = [
  "src/app/(frontend)/posts/[slug]/page.tsx",
  "src/app/(frontend)/notes/[slug]/page.tsx",
  "src/app/(frontend)/activities/[date]/[slug]/page.tsx",
  "src/app/(frontend)/projects/[project]/page.tsx",
  "src/app/(frontend)/topics/[slug]/page.tsx",
  "src/app/(frontend)/posts/page.tsx",
  "src/app/(frontend)/notes/page.tsx",
  "src/app/(frontend)/activities/page.tsx",
  "src/app/(frontend)/projects/page.tsx",
  "src/app/(frontend)/posts/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/notes/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/activities/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/projects/[project]/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/topics/[slug]/page/[pageNumber]/page.tsx",
  "src/app/(frontend)/page.tsx",
  "src/app/(frontend)/page/[pageNumber]/page.tsx",
];

const metadataHelperMarkers = [
  "metadataBase",
  "buildLyovsonMetadata(",
  "buildSeoMetadata(",
  "buildNotFoundMetadata(",
  "buildPaginatedArchiveMetadata(",
];

const noindexExcludedFromSitemap = [
  "/playground",
  ".well-known/ai-resources",
  "llms.txt",
];

const brandedTitlePattern =
  /title:\s*(?:`[^`]*\|\s*Ly(?:ov|óv)son\.com[^`]*`|"[^"]*\|\s*Ly(?:ov|óv)son\.com[^"]*"|'[^']*\|\s*Ly(?:ov|óv)son\.com[^']*')/;
const brandedTitleVariablePattern = /const title = .*?\|\s*Ly(?:ov|óv)son\.com/;

const apexLiteralPattern = /https:\/\/lyovson\.com/;

const apexCheckTargets = [
  "src",
  "next.config.ts",
  "redirects.js",
  ".env.local",
];

function getAbsolutePath(file) {
  return path.join(ROOT, file);
}

async function fileExists(file) {
  try {
    await access(getAbsolutePath(file));
    return true;
  } catch {
    return false;
  }
}

function readRelativeFile(file) {
  return readFile(getAbsolutePath(file), "utf8");
}

async function listFilesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function hasMetadataExport(source) {
  return (
    source.includes("export const metadata") ||
    source.includes("generateMetadata(")
  );
}

async function checkMetadataWiring() {
  const issues = [];

  for (const relativeDirectory of requiredMetadataDirectories) {
    const absoluteDirectory = getAbsolutePath(relativeDirectory);
    const files = await listFilesRecursively(absoluteDirectory);

    for (const file of files) {
      if (!(file.endsWith(".ts") || file.endsWith(".tsx"))) {
        continue;
      }

      const source = await readFile(file, "utf8");

      if (!hasMetadataExport(source)) {
        continue;
      }

      if (!metadataHelperMarkers.some((marker) => source.includes(marker))) {
        issues.push(
          `Missing shared metadata helper or metadataBase in: ${path.relative(ROOT, file)}`
        );
      }
    }
  }

  return issues;
}

async function checkCanonicalCoverage() {
  const issues = [];

  for (const file of requiredCanonicalFiles) {
    const source = await readRelativeFile(file);

    if (!source.includes("canonical")) {
      issues.push(`Missing canonical metadata wiring: ${file}`);
    }
  }

  return issues;
}

async function checkJsonLdCoverage() {
  const issues = [];

  for (const file of requiredJsonLdFiles) {
    const source = await readRelativeFile(file);
    const hasJsonLd = source.includes("JsonLd");
    const hasSchemaGenerator =
      source.includes("generateCollectionPageSchema") ||
      source.includes("generateArticleSchema") ||
      source.includes("generatePersonSchema");

    if (!(hasJsonLd && hasSchemaGenerator)) {
      issues.push(`Missing structured data wiring: ${file}`);
    }
  }

  const layoutSource = await readRelativeFile("src/app/(frontend)/layout.tsx");
  if (!layoutSource.includes("getSiteEntitySchemas")) {
    issues.push(
      "Site-wide schema should come from getSiteEntitySchemas in the frontend layout."
    );
  }

  const schemaSource = await readRelativeFile(
    "src/utilities/generate-json-ld.ts"
  );
  if (!schemaSource.includes("alternateName")) {
    issues.push("WebSite schema is missing alternateName support.");
  }
  if (!schemaSource.includes("ProfilePage")) {
    issues.push("Structured data helpers are missing ProfilePage support.");
  }

  return issues;
}

async function checkSitemapExclusions() {
  const issues = [];
  const source = await readRelativeFile("src/app/sitemap.ts");

  for (const route of noindexExcludedFromSitemap) {
    if (source.includes(route)) {
      issues.push(`Non-index target should not be in sitemap: ${route}`);
    }
  }

  return issues;
}

async function checkBrandedPageTitles() {
  const issues = [];
  const files = await listFilesRecursively(
    getAbsolutePath("src/app/(frontend)")
  );

  for (const file of files) {
    if (!(file.endsWith(".ts") || file.endsWith(".tsx"))) {
      continue;
    }

    const source = await readFile(file, "utf8");

    if (
      brandedTitlePattern.test(source) ||
      brandedTitleVariablePattern.test(source)
    ) {
      issues.push(
        `Page metadata title still includes site branding: ${path.relative(ROOT, file)}`
      );
    }
  }

  return issues;
}

async function checkApexLiterals() {
  const issues = [];

  for (const target of apexCheckTargets) {
    const absoluteTarget = getAbsolutePath(target);
    const exists = await fileExists(target);

    if (!exists) {
      continue;
    }

    const files =
      path.extname(absoluteTarget) ||
      path.basename(absoluteTarget).startsWith(".")
        ? [absoluteTarget]
        : await listFilesRecursively(absoluteTarget);

    for (const file of files) {
      const source = await readFile(file, "utf8");
      if (apexLiteralPattern.test(source)) {
        issues.push(
          `Apex host literal found outside canonical config: ${path.relative(ROOT, file)}`
        );
      }
    }
  }

  return issues;
}

async function checkLogoAssetAndLlmsRoute() {
  const issues = [];

  if (!(await fileExists("public/android-chrome-512x512.png"))) {
    issues.push(
      "Missing structured-data logo asset: public/android-chrome-512x512.png"
    );
  }

  const siteConfigSource = await readRelativeFile(
    "src/utilities/site-config.ts"
  );
  if (siteConfigSource.includes("logo-black.webp")) {
    issues.push("Site config still references logo-black.webp.");
  }

  const sourceFiles = await listFilesRecursively(getAbsolutePath("src"));
  for (const file of sourceFiles) {
    if (!(file.endsWith(".ts") || file.endsWith(".tsx"))) {
      continue;
    }

    const source = await readFile(file, "utf8");
    if (source.includes("logo-black.webp")) {
      issues.push(
        `Found stale logo-black.webp reference in: ${path.relative(ROOT, file)}`
      );
    }
  }

  if (!(await fileExists("src/app/llms.txt/route.ts"))) {
    issues.push("Missing generated llms.txt route: src/app/llms.txt/route.ts");
  }

  if (await fileExists("public/llms.txt")) {
    issues.push(
      "public/llms.txt should be removed in favor of the route handler."
    );
  }

  if (await fileExists("public/site.webmanifest")) {
    issues.push(
      "public/site.webmanifest should be removed in favor of src/app/manifest.ts."
    );
  }

  const redirectSource = await readRelativeFile("redirects.js");
  if (!redirectSource.includes('source: "/site.webmanifest"')) {
    issues.push("Missing compatibility redirect for /site.webmanifest.");
  }

  return issues;
}

async function main() {
  const checks = await Promise.all([
    checkMetadataWiring(),
    checkCanonicalCoverage(),
    checkJsonLdCoverage(),
    checkSitemapExclusions(),
    checkBrandedPageTitles(),
    checkApexLiterals(),
    checkLogoAssetAndLlmsRoute(),
  ]);

  const issues = checks.flat();

  if (issues.length === 0) {
    console.log("SEO coverage checks passed.");
    process.exit(0);
  }

  console.error("SEO coverage checks failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

main().catch((error) => {
  console.error("SEO coverage checks crashed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
