import { NextRequest } from "next/server";
import { getPayload } from "payload";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GET as getActivity,
  POST as postActivity,
} from "@/app/api/embeddings/activities/[id]/route";
import {
  GET as getNote,
  POST as postNote,
} from "@/app/api/embeddings/notes/[id]/route";
import {
  GET as getPost,
  POST as postPost,
} from "@/app/api/embeddings/posts/[id]/route";
import { POST as regenerate } from "@/app/api/embeddings/regenerate/route";
import { GET as getEmbeddings } from "@/app/api/embeddings/route";
import { GET as getStatus } from "@/app/api/embeddings/status/route";
import { POST as sync } from "@/app/api/embeddings/sync/route";
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
vi.mock("./generate-embedding-helpers", () => ({
  buildPostEmbeddingText: vi.fn(),
  buildNoteEmbeddingText: vi.fn(),
  generateEmbeddingForPost: vi.fn(),
  generateEmbeddingForNote: vi.fn(),
  generateEmbeddingForActivity: vi.fn(),
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
    ["POST", "/regenerate", regenerate],
    ["GET", "/posts/1", getPost],
    ["POST", "/posts/1", postPost],
    ["GET", "/notes/1", getNote],
    ["POST", "/notes/1", postNote],
    ["GET", "/activities/1", getActivity],
    ["POST", "/activities/1", postActivity],
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
      const response = await handler(request, {
        params: Promise.resolve({ id: "1" }),
      });
      expect(response.status).toBe(401);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
      expect(getPayload).not.toHaveBeenCalled();
      const auth = vi.fn().mockResolvedValue({ user: null });
      vi.mocked(getPayload).mockResolvedValue({ auth } as never);
      const invalidRequest = new NextRequest(request.clone(), {
        headers: { authorization: "Bearer invalid-token" },
      });
      const denied = await handler(invalidRequest, {
        params: Promise.resolve({ id: "1" }),
      });
      expect(denied.status).toBe(401);
      expect(denied.headers.get("Cache-Control")).toBe("no-store");
    }
  );
});
