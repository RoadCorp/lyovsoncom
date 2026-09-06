import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
process.chdir(fileURLToPath(new URL("../", import.meta.url)));
require("dotenv").config({ path: [".env.local", ".env"], quiet: true });
const command = process.argv[2];
if (command !== "build" && command !== "start") {
  throw new Error(
    "Use build or start for the local public-experience preview."
  );
}
const env = {
  ...process.env,
  PAYLOAD_DB_PUSH: "false",
  NEXT_TEST_MODE: "1",
  OPENAI_API_KEY: "",
  RESEND_API_KEY: "",
};
if (!env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is required for the read-only preview.");
}
const database = new URL(
  env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL.replace("-pooler.", ".")
);
database.searchParams.set("options", "-c default_transaction_read_only=on");
env.POSTGRES_URL = database.toString();
const args =
  command === "start"
    ? ["start", "--hostname", "127.0.0.1", "--port", "3100"]
    : ["build"];
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), ...args],
  { env, stdio: "inherit" }
);
child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
