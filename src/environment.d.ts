declare global {
  // biome-ignore lint/style/noNamespace: NodeJS ProcessEnv augmentation uses namespace merging.
  namespace NodeJS {
    // Only PAYLOAD_SECRET and POSTGRES_URL are required. Each provider key is
    // optional: its feature degrades or turns off when the key is unset.
    // Vercel sets the VERCEL_* values on deployments; PAYLOAD_DB_PUSH is
    // opt-in for local database branches only.
    interface ProcessEnv {
      BING_SITE_VERIFICATION?: string;
      BLOB_READ_WRITE_TOKEN?: string;
      CRON_SECRET?: string;
      FACEBOOK_APP_ID?: string;
      FACEBOOK_DOMAIN_VERIFICATION?: string;
      GOOGLE_SITE_VERIFICATION?: string;
      NEXT_PUBLIC_SERVER_URL?: string;
      NEXT_TEST_MODE?: string;
      OPENAI_API_KEY?: string;
      PAYLOAD_DB_PUSH?: "true" | "false";
      PAYLOAD_SECRET: string;
      POSTGRES_URL: string;
      RESEND_API_KEY?: string;
      TENOR_API_KEY?: string;
      VERCEL?: string;
      VERCEL_ENV?: "development" | "preview" | "production";
      VERCEL_PROJECT_PRODUCTION_URL?: string;
      VERCEL_URL?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
