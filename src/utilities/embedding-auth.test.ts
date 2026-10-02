import { NextRequest } from "next/server";
import { getPayload } from "payload";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GET as getDocument,
  POST as postDocument,
} from "@/app/api/embeddings/[collection]/[id]/route";
import { POST as regenerate } from "@/app/api/embeddings/regenerate/route";
import { GET as getEmbeddings } from "@/app/api/embeddings/route";
import { GET as getStatus } from "@/app/api/embeddings/status/route";
import { GET as cronSync, POST as sync } from "@/app/api/embeddings/sync/route";
import { authorizeEmbeddingMutation } from "./embedding-auth";

vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn() }));
vi.mock("./api-telemetry", () => ({ logApiTelemetry: vi.fn() }));
vi.mock("./generate-embedding", () => ({
  EMBEDDING_MODEL: "test-model",
  EMBEDDING_VECTOR_DIMENSIONS: 1536,
  generateEmbedding: vi.fn(),
  createTextHash: vi.fn(),
}));
vi.mock("./generate-embedding-helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./generate-embedding-helpers")>()),
  generateEmbeddingFor: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "test-cron-secret");
});
afterEach(() => vi.unstubAllEnvs());

describe("embedding authorization", () => {
  it("accepts the exact cron secret without session authentication", async () => {
    const auth = vi.fn();
    const request = new NextRequest("https://www.lyovson.com/api/embeddings", {
      headers: { authorization: "Bearer test-cron-secret" },
    });
    expect(
      await authorizeEmbeddingMutation(request, { auth } as never)
    ).toEqual({ authorized: true });
    expect(auth).not.toHaveBeenCalled();
  });

  it.each(["Bearer wrong-secret", "Bearer ", "Basic test-cron-secret"])(
    "rejects invalid authorization %s when there is no authenticated user",
    async (authorization) => {
      const auth = vi.fn().mockResolvedValue({ user: null });
      const request = new NextRequest(
        "https://www.lyovson.com/api/embeddings",
        { headers: { authorization } }
      );
      expect(
        await authorizeEmbeddingMutation(request, { auth } as never)
      ).toMatchObject({ authorized: false });
    }
  );

  it("passes session cookies to Payload and accepts its authenticated user", async () => {
    const auth = vi.fn().mockResolvedValue({ user: { id: 1 } });
    const request = new NextRequest("https://www.lyovson.com/api/embeddings", {
      headers: { cookie: "payload-token=test-session" },
    });
    expect(
      await authorizeEmbeddingMutation(request, { auth } as never)
    ).toEqual({ authorized: true });
    expect(auth).toHaveBeenCalledWith({ headers: request.headers });
  });

  it("fails closed when session verification throws", async () => {
    vi.stubEnv("CRON_SECRET", undefined);
    const auth = vi.fn().mockRejectedValue(new Error("Invalid token"));
    const request = new NextRequest("https://www.lyovson.com/api/embeddings", {
      headers: { authorization: "Bearer undefined" },
    });
    expect(
      await authorizeEmbeddingMutation(request, { auth } as never)
    ).toMatchObject({ authorized: false });
  });
});

describe("embedding endpoint guards", () => {
  it.each([
    ["GET", "", getEmbeddings],
    ["GET", "/status", getStatus],
    ["POST", "/sync", sync],
    ["GET", "/sync", cronSync],
    ["POST", "/regenerate", regenerate],
    ["GET", "/posts/1", getDocument],
    ["POST", "/posts/1", postDocument],
    ["GET", "/notes/1", getDocument],
    ["POST", "/notes/1", postDocument],
    ["GET", "/activities/1", getDocument],
    ["POST", "/activities/1", postDocument],
  ] as const)(
    "protects %s /api/embeddings%s from anonymous and invalid credentials",
    async (method, path, handler) => {
      const request = new NextRequest(
        `https://www.lyovson.com/api/embeddings${path}`,
        {
          method,
          ...(method === "POST"
            ? { body: JSON.stringify({ action: "regenerate" }) }
            : {}),
        }
      );
      // Collection routes read their collection from the path.
      const params = Promise.resolve({
        collection: path.split("/")[1] ?? "",
        id: "1",
      });
      const response = await handler(request, { params });
      expect(response.status).toBe(401);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
      expect(getPayload).not.toHaveBeenCalled();
      const auth = vi.fn().mockResolvedValue({ user: null });
      vi.mocked(getPayload).mockResolvedValue({ auth } as never);
      const invalidRequest = new NextRequest(request.clone(), {
        headers: { authorization: "Bearer invalid-token" },
      });
      const denied = await handler(invalidRequest, { params });
      expect(denied.status).toBe(401);
      expect(denied.headers.get("Cache-Control")).toBe("no-store");
    }
  );
});

describe("document embedding route", () => {
  it("rejects unknown collections before any auth or database work", async () => {
    const response = await getDocument(
      new NextRequest("https://www.lyovson.com/api/embeddings/users/1"),
      { params: Promise.resolve({ collection: "users", id: "1" }) }
    );
    expect(response.status).toBe(404);
    expect(getPayload).not.toHaveBeenCalled();
  });
});

describe("scheduled embedding sync", () => {
  it("runs a stale-only sync of every collection for the cron secret", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    vi.mocked(getPayload).mockResolvedValue({ find } as never);
    const response = await cronSync(
      new NextRequest("https://www.lyovson.com/api/embeddings/sync", {
        headers: { authorization: "Bearer test-cron-secret" },
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      mode: "stale-only",
      collections: ["posts", "notes", "activities"],
      limitPerCollection: 25,
    });
    expect(find).toHaveBeenCalledTimes(3);
  });
});
