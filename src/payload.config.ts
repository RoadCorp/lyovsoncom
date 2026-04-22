// storage-adapter-import-placeholder

import path from "node:path";
import { fileURLToPath } from "node:url";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { sql } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { buildConfig } from "payload";
import sharp from "sharp"; // sharp-import
import { Activities } from "@/collections/Activities";
import { Contacts } from "@/collections/Contacts";
import { Lyovsons } from "@/collections/Lyovsons";
import { Media } from "@/collections/Media";
import { Notes } from "@/collections/Notes";
import { Posts } from "@/collections/Posts";
import { Projects } from "@/collections/Projects";
import { References } from "@/collections/References";
import { Topics } from "@/collections/Topics";
import { tsvector } from "@/db/custom-types";
import { defaultLexical } from "@/fields/defaultLexical";
import { ComputeRecommendations } from "@/jobs/tasks/compute-recommendations";
import { GenerateEmbedding } from "@/jobs/tasks/generate-embedding";
import { ProcessPostEmbeddings } from "@/jobs/workflows/process-post-embeddings";
import { plugins } from "@/plugins";
import { getServerSideURL } from "@/utilities/getURL";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const DEV_POOL_MAX = 3;
const PROD_POOL_MAX = 1;

export default buildConfig({
  // Development optimizations
  debug: process.env.NODE_ENV === "development",

  // Skip heavy operations in development
  onInit: (payload) => {
    if (process.env.NODE_ENV === "development") {
      payload.logger.info("🚀 Payload CMS initialized in development mode");
    }
  },

  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Lyovsons.slug,
    meta: {
      titleSuffix: " — Lyóvson.com",
      icons: [
        { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          url: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          url: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          url: "/apple-touch-icon.png",
        },
      ],
    },
    components: {
      graphics: {
        Icon: "@/components/admin/icon",
        Logo: "@/components/admin/logo",
      },
      afterLogin: ["@/components/admin/login-text"],
      afterNavLinks: ["@/components/admin/view-site-link"],
      providers: ["@/components/admin/admin-font-provider#AdminFontProvider"],
    },
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    push: true, // Enable schema push - custom columns are now protected via afterSchemaInit
    pool: {
      connectionString: process.env.POSTGRES_URL || "",
      // Optimized settings for faster schema introspection
      max: process.env.NODE_ENV === "production" ? PROD_POOL_MAX : DEV_POOL_MAX,
      min: 0, // No minimum connections
      idleTimeoutMillis: 10_000, // Faster idle timeout (10s)
      connectionTimeoutMillis: 15_000, // Slightly reduce timeout (15s)
      allowExitOnIdle: true, // Allow process to exit when idle
    },
    // Critical: Filter out PostgreSQL extension objects to prevent Drizzle from trying to manage them
    tablesFilter: [
      // Exclude pg_stat_statements extension objects using negation
      "!pg_stat_statements",
      "!pg_stat_statements_info",

      // Exclude pgvector extension functions (they appear as tables in introspection)
      "!vector_*",
      "!halfvec_*",
      "!sparsevec_*",
      "!array_to_vector",
      "!cosine_distance",
      "!inner_product",
      "!l2_distance",
      "!l1_distance",
      "!hamming_distance",
      "!jaccard_distance",

      // Include all other tables with wildcard
      "*",
    ],
    // Use afterSchemaInit to extend schema with custom columns (official Payload pattern)
    afterSchemaInit: [
      ({ schema, extendTable }) => {
        // Add content_text column to store extracted plain text from Lexical content
        // This is populated via Payload hook (see Posts collection)
        // Add tsvector column for hybrid full-text search
        // This prevents Drizzle from deleting the column while allowing schema push
        extendTable({
          table: schema.tables.posts,
          columns: {
            content_text: varchar("content_text"),
            search_vector: tsvector("search_vector")
              .notNull()
              .generatedAlwaysAs(
                () =>
                  sql`to_tsvector('english',
                    coalesce(${schema.tables.posts.title}, '') || ' ' ||
                    coalesce(${schema.tables.posts.description}, '') || ' ' ||
                    coalesce(${schema.tables.posts.content_text}, '')
                  )`
              ),
          },
        });

        // Add search columns for Notes
        extendTable({
          table: schema.tables.notes,
          columns: {
            content_text: varchar("content_text"),
            search_vector: tsvector("search_vector")
              .notNull()
              .generatedAlwaysAs(
                () =>
                  sql`to_tsvector('english',
                    coalesce(${schema.tables.notes.title}, '') || ' ' ||
                    coalesce(${schema.tables.notes.content_text}, '')
                  )`
              ),
          },
        });

        // Add search columns for Activities
        extendTable({
          table: schema.tables.activities,
          columns: {
            content_text: varchar("content_text"),
            search_vector: tsvector("search_vector")
              .notNull()
              .generatedAlwaysAs(
                () =>
                  sql`to_tsvector('english',
                    coalesce(${schema.tables.activities.content_text}, '')
                  )`
              ),
          },
        });

        return schema;
      },
    ],
  }),
  collections: [
    Posts,
    Media,
    Topics,
    Projects,
    Lyovsons,
    Contacts,
    References,
    Activities,
    Notes,
  ],
  jobs: {
    // Register tasks (reusable building blocks)
    tasks: [GenerateEmbedding, ComputeRecommendations],

    // Register workflows (orchestrate tasks)
    workflows: [ProcessPostEmbeddings],

    // Access control - secure the jobs endpoint
    access: {
      run: ({ req }) => {
        // Allow authenticated admins or requests with valid CRON_SECRET
        const cronSecret = req.headers
          .get("authorization")
          ?.replace("Bearer ", "");
        return Boolean(
          req.user || (cronSecret && cronSecret === process.env.CRON_SECRET)
        );
      },
    },
  },
  cors: [getServerSideURL()].filter(Boolean),
  globals: [],
  plugins: [
    ...plugins,
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
  email: resendAdapter({
    defaultFromAddress: "notifications@mail.lyovson.com",
    defaultFromName: "Lyovsons",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
