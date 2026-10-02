import { afterEach, describe, expect, it, vi } from "vitest";
import { isCronRequest } from "./cron-auth";

const withAuthorization = (authorization?: string) =>
  new Headers(authorization ? { authorization } : {});

afterEach(() => vi.unstubAllEnvs());

describe("isCronRequest", () => {
  it("accepts the configured secret as a bearer token", () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    expect(isCronRequest(withAuthorization("Bearer test-cron-secret"))).toBe(
      true
    );
  });

  it.each([
    ["the secret without the Bearer scheme", "test-cron-secret"],
    ["another scheme", "Basic test-cron-secret"],
    ["a wrong secret", "Bearer wrong-secret"],
    ["a prefix of the secret", "Bearer test-cron"],
    ["an empty token", "Bearer "],
    ["no header", undefined],
  ])("rejects %s", (_label, authorization) => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    expect(isCronRequest(withAuthorization(authorization))).toBe(false);
  });

  it("fails closed when CRON_SECRET is not configured", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(isCronRequest(withAuthorization("Bearer "))).toBe(false);
  });
});
