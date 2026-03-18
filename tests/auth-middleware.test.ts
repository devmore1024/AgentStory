import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_SESSION_FAILURE_GRACE_MS,
  serializeAuthSession,
  type AuthSession
} from "@/lib/auth-session";

const refreshSecondMeToken = vi.fn();

vi.mock("@/lib/secondme", () => ({
  refreshSecondMeToken
}));

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() - 60 * 1000,
    scope: ["chat"],
    secondMeUserId: "secondme-user-1",
    displayName: "Agent Story",
    avatar: null,
    ...overrides
  };
}

describe("auth middleware", () => {
  beforeEach(() => {
    refreshSecondMeToken.mockReset();
  });

  it("refreshes near-expired sessions and persists a long-lived cookie", async () => {
    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/me", {
      headers: {
        cookie: `agentstory_session=${serializeAuthSession(
          createSession({
            expiresAt: Date.now() - 1000
          })
        )}`
      }
    });

    refreshSecondMeToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresIn: 7200,
      scope: ["chat", "profile"]
    });

    const response = await middleware(request);

    expect(refreshSecondMeToken).toHaveBeenCalledWith("refresh-token");
    expect(response.cookies.get("agentstory_session")?.value).toBeTruthy();
    expect(response.cookies.get("agentstory_session")?.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it("keeps the current request alive during the refresh failure grace window", async () => {
    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/me", {
      headers: {
        cookie: `agentstory_session=${serializeAuthSession(createSession())}`
      }
    });

    refreshSecondMeToken.mockRejectedValue(new Error("temporary outage"));

    const response = await middleware(request);

    expect(refreshSecondMeToken).toHaveBeenCalledTimes(1);
    expect(response.cookies.get("agentstory_session")).toBeUndefined();
  });

  it("clears the cookie once refresh has failed beyond the grace window", async () => {
    const { middleware } = await import("@/middleware");
    const request = new NextRequest("http://localhost:3000/me", {
      headers: {
        cookie: `agentstory_session=${serializeAuthSession(
          createSession({
            expiresAt: Date.now() - AUTH_SESSION_FAILURE_GRACE_MS - 1000
          })
        )}`
      }
    });

    refreshSecondMeToken.mockRejectedValue(new Error("expired refresh token"));

    const response = await middleware(request);

    expect(response.cookies.get("agentstory_session")?.maxAge).toBe(0);
  });
});
